import pako from 'pako';
import type { AnomalyDataset } from '@/types/anomaly.types';
import { AnomalyDatasetSchema, FileUploadSchema } from './schemas';

export async function processDataFile(file: File): Promise<AnomalyDataset> {
  // Validate file
  const fileValidation = FileUploadSchema.safeParse({ file });
  if (!fileValidation.success) {
    throw new Error(`Invalid file: ${fileValidation.error.errors[0].message}`);
  }

  const isGzipped = file.name.endsWith('.gz') || file.type === 'application/gzip';
  
  try {
    let jsonString: string;
    
    if (isGzipped) {
      // Read as array buffer for gzip decompression
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Decompress using pako
      const decompressed = pako.ungzip(uint8Array);
      
      // Convert to string
      const decoder = new TextDecoder('utf-8');
      jsonString = decoder.decode(decompressed);
    } else {
      // Read as text for regular JSON
      jsonString = await file.text();
    }
    
    // Parse JSON
    const data = JSON.parse(jsonString);

    // Validate data structure
    const dataValidation = AnomalyDatasetSchema.safeParse(data);
    if (!dataValidation.success) {
      const firstError = dataValidation.error.errors[0];
      throw new Error(`Invalid dataset format: ${firstError.path.join('.')} - ${firstError.message}`);
    }
    
    // Process in a web worker for large files
    if (jsonString.length > 10 * 1024 * 1024) { // > 10MB
      return await processInWorker(data);
    }
    
    return processDataset(data);
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        throw new Error('Invalid JSON format in file');
      } else if (error.message.includes('gzip') || error.message.includes('pako')) {
        throw new Error('Failed to decompress gzipped file');
      }
    }
    throw new Error('Failed to process file');
  }
}

function processDataset(data: AnomalyDataset): AnomalyDataset {
  // Ensure all dates are properly formatted
  if (data.anomalies) {
    data.anomalies = data.anomalies.map((anomaly) => ({
      ...anomaly,
      timestamp: new Date(anomaly.timestamp).toISOString()
    }));
  }
  
  // Sort anomalies by unified score (highest first)
  if (data.anomalies) {
    data.anomalies.sort((a, b) => b.unified_score - a.unified_score);
  }
  
  // Index anomalies for fast lookup
  if (data.anomalies) {
    data._index = new Map(
      data.anomalies.map((a, idx) => [a.id, idx])
    );
  }
  
  return data as AnomalyDataset;
}

async function processInWorker(data: AnomalyDataset): Promise<AnomalyDataset> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./dataWorker.ts', import.meta.url),
      { type: 'module' }
    );
    
    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.result);
      }
      worker.terminate();
    };
    
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
    
    worker.postMessage({ action: 'process', data });
  });
}