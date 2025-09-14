import pako from 'pako';
import type { AnomalyDataset } from '@/types/anomaly.types';
import { SimplifiedDatasetSchema, FileUploadSchema } from './schemas';

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

    // Validate with simplified schema
    const simplifiedValidation = SimplifiedDatasetSchema.safeParse(data);
    if (!simplifiedValidation.success) {
      const firstError = simplifiedValidation.error.errors[0];
      throw new Error(`Invalid dataset format: ${firstError.path.join('.')} - ${firstError.message}`);
    }

    // Convert simplified format to full format
    return convertSimplifiedToFull(simplifiedValidation.data);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid dataset format')) {
        throw error;
      } else if (error.message.includes('JSON')) {
        throw new Error('Invalid JSON format in file');
      } else if (error.message.includes('gzip') || error.message.includes('pako')) {
        throw new Error('Failed to decompress gzipped file');
      }
    }
    throw new Error('Failed to process file');
  }
}

function convertSimplifiedToFull(simplified: any): AnomalyDataset {
  const now = new Date().toISOString();

  // Map simplified anomalies to full format
  const anomalies = simplified.anomalies.map((a: any, index: number) => ({
    id: a.id,
    subject_type: 'transaction' as const,
    subject_id: a.id,
    timestamp: now,
    anomaly_types: ['point'] as any,
    severity: a.severity === 'high' ? 0.9 : a.severity === 'medium' ? 0.6 : 0.3,
    materiality: a.anomaly_score * 0.8,
    unified_score: a.anomaly_score,
    reason_codes: [{
      code: a.category.toUpperCase().replace(/\s+/g, '_'),
      text: a.ai_explanation
    }],
    explanations: {
      shap_local: [],
      feature_deltas: []
    },
    case: {
      status: 'open' as const,
      tags: [a.category, a.detection_method, a.severity]
    }
  }));

  // Sort anomalies by score (highest first)
  anomalies.sort((a: any, b: any) => b.unified_score - a.unified_score);

  return {
    run_id: now,
    dataset_profile: {
      rows: simplified.total_records,
      columns: 0,
      primary_keys: ['id'],
      entity_keys: ['category'],
      time_key: 'timestamp',
      currency: 'USD'
    },
    anomalies,
    _index: new Map(anomalies.map((a: any, idx: number) => [a.id, idx]))
  } as AnomalyDataset;
}