import pako from 'pako';
import type { AnomalyDataset } from '@/types/anomaly.types';
import { SimplifiedDatasetSchema, FileUploadSchema } from './schemas';
import { parseCSV, type ParsedCSVRow } from './csvParser';

export async function processDataFile(file: File): Promise<AnomalyDataset> {
  // Validate file
  const fileValidation = FileUploadSchema.safeParse({ file });
  if (!fileValidation.success) {
    const firstIssue = fileValidation.error.issues[0];
    throw new Error(`Invalid file: ${firstIssue?.message || 'validation failed'}`);
  }

  const isGzipped = file.name.endsWith('.gz') || file.type === 'application/gzip';
  const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv';

  try {
    let content: string;

    if (isGzipped) {
      // Read as array buffer for gzip decompression
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Decompress using pako
      const decompressed = pako.ungzip(uint8Array);

      // Convert to string
      const decoder = new TextDecoder('utf-8');
      content = decoder.decode(decompressed);
    } else {
      // Read as text for regular files
      content = await file.text();
    }

    // Process based on file type
    if (isCSV) {
      return processCSVData(content);
    } else {
      return processJSONData(content);
    }

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid dataset format') ||
          error.message.includes('Missing required columns') ||
          error.message.includes('CSV file must contain')) {
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

function processCSVData(csvContent: string): AnomalyDataset {
  const rows = parseCSV(csvContent);

  if (rows.length === 0) {
    throw new Error('CSV file contains no data');
  }

  const now = new Date().toISOString();

  // Extract custom field names (all fields except the required ones)
  const requiredFields = ['id', 'category', 'severity', 'anomaly_score', 'detection_method', 'ai_explanation', 'review_status', 'anomaly_notes'];
  const firstRow = rows[0];
  if (!firstRow) {
    throw new Error('CSV file contains no valid data rows');
  }
  const customFieldNames = Object.keys(firstRow).filter(key => !requiredFields.includes(key));

  // Collect review data to pass back
  const reviewData: { reviewedAnomalies: Record<string, 'confirmed' | 'rejected'>, anomalyNotes: Record<string, string> } = {
    reviewedAnomalies: {},
    anomalyNotes: {}
  };

  // Convert CSV rows to anomaly format
  const anomalies = rows.map((row: ParsedCSVRow) => {
    // Extract review status and notes if present
    if (row.review_status && row.review_status !== 'unreviewed') {
      reviewData.reviewedAnomalies[row.id] = row.review_status as 'confirmed' | 'rejected';
    }
    if (row.anomaly_notes) {
      reviewData.anomalyNotes[row.id] = row.anomaly_notes;
    }

    // Extract custom fields
    const customFields: Record<string, any> = {};
    customFieldNames.forEach(field => {
      if (row[field] !== undefined && row[field] !== '') {
        customFields[field] = row[field];
      }
    });

    return {
      id: row.id,
      subject_type: 'transaction' as const,
      subject_id: row.id,
      timestamp: now,
      anomaly_types: ['point'] as any,
      severity: row.severity === 'high' ? 0.9 : row.severity === 'medium' ? 0.6 : 0.3,
      materiality: row.anomaly_score * 0.8,
      unified_score: row.anomaly_score,
      reason_codes: [{
        code: row.category.toUpperCase().replace(/\s+/g, '_'),
        text: row.ai_explanation
      }],
      explanations: {
        shap_local: [],
        feature_deltas: []
      },
      case: {
        status: 'open' as const,
        tags: [row.category, row.detection_method, row.severity]
      },
      // Store custom fields for display
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined
    };
  });

  // Sort anomalies by score (highest first)
  anomalies.sort((a: any, b: any) => b.unified_score - a.unified_score);

  const dataset = {
    run_id: now,
    dataset_profile: {
      rows: rows.length * 200, // Estimate total records
      columns: Object.keys(firstRow).length,
      primary_keys: ['id'],
      entity_keys: ['category'],
      time_key: 'timestamp',
      currency: 'USD'
    },
    anomalies,
    _index: new Map(anomalies.map((a: any, idx: number) => [a.id, idx]))
  } as AnomalyDataset;

  // Attach review data to the dataset for restoration
  (dataset as any)._reviewData = reviewData;

  return dataset;
}

function processJSONData(jsonString: string): AnomalyDataset {
  // Parse JSON
  const data = JSON.parse(jsonString);

  // Validate with simplified schema
  const simplifiedValidation = SimplifiedDatasetSchema.safeParse(data);
  if (!simplifiedValidation.success) {
    const firstError = simplifiedValidation.error.issues[0];
    if (!firstError) {
      throw new Error('Invalid dataset format: validation failed');
    }
    throw new Error(`Invalid dataset format: ${firstError.path.join('.')} - ${firstError.message}`);
  }

  // Convert simplified format to full format
  return convertSimplifiedToFull(simplifiedValidation.data);
}

function convertSimplifiedToFull(simplified: any): AnomalyDataset {
  const now = new Date().toISOString();

  // Map simplified anomalies to full format
  const anomalies = simplified.anomalies.map((a: any) => ({
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