import { z } from 'zod';
import { config } from '@/config/env';

// Simplified schema for anomaly detection display
export const SimplifiedAnomalySchema = z.object({
  id: z.string(),
  category: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  anomaly_score: z.number().min(0).max(1),
  detection_method: z.string(),
  ai_explanation: z.string()
});

export const SimplifiedDatasetSchema = z.object({
  total_records: z.number().min(0),
  anomalies_detected: z.number().min(0),
  anomalies: z.array(SimplifiedAnomalySchema).min(1)
});

// File validation - use environment config or fallback to default
export const MAX_FILE_SIZE = config.limits.maxFileSizeBytes || 100 * 1024 * 1024; // Use env or default to 100MB
export const ALLOWED_FILE_TYPES = ['application/json', 'text/plain', 'application/x-gzip', 'text/csv'];

export const FileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
  ).refine(
    (file) => ALLOWED_FILE_TYPES.includes(file.type) ||
             file.name.endsWith('.json') ||
             file.name.endsWith('.csv') ||
             file.name.endsWith('.gz'),
    'File must be JSON, CSV, or GZIP format'
  )
});

export type SimplifiedDataset = z.infer<typeof SimplifiedDatasetSchema>;
export type SimplifiedAnomaly = z.infer<typeof SimplifiedAnomalySchema>;