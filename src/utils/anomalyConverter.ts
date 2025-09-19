import type { Anomaly } from '@/types/anomaly.types';

/**
 * Convert a simplified data row to internal Anomaly format
 * Centralizes the conversion logic to avoid duplication
 */
export function convertToAnomaly(row: any, timestamp?: string): Anomaly {
  const now = timestamp || new Date().toISOString();

  return {
    id: row.id,
    subject_type: 'transaction' as const,
    subject_id: row.id,
    timestamp: now,
    anomaly_types: ['point'] as any,
    severity: normalizeSeverity(row.severity, row.anomaly_score),
    materiality: row.anomaly_score * 0.8,
    unified_score: row.anomaly_score,
    reason_codes: [{
      code: row.category.toUpperCase().replace(/\s+/g, '_'),
      text: row.ai_explanation || row.explanation || 'No explanation available'
    }],
    explanations: {
      shap_local: [],
      feature_deltas: []
    },
    case: {
      status: 'open' as const,
      tags: [row.category, row.detection_method, row.severity].filter(Boolean)
    },
    customFields: extractCustomFields(row)
  };
}

/**
 * Normalize severity value from string or number
 */
export function normalizeSeverity(severity: string | number, score?: number): number {
  if (typeof severity === 'number') return severity;
  if (severity === 'high') return 0.9;
  if (severity === 'medium') return 0.6;
  if (severity === 'low') return 0.3;
  return score || 0.5;
}

/**
 * Extract custom fields from a data row
 */
export function extractCustomFields(row: Record<string, any>): Record<string, any> | undefined {
  const excludeFields = [
    'id', 'category', 'severity', 'anomaly_score',
    'detection_method', 'ai_explanation', 'explanation',
    'review_status', 'anomaly_notes'
  ];

  const customFields: Record<string, any> = {};

  Object.entries(row).forEach(([key, value]) => {
    if (!excludeFields.includes(key) && value !== undefined && value !== '') {
      customFields[key] = value;
    }
  });

  return Object.keys(customFields).length > 0 ? customFields : undefined;
}

/**
 * Sort anomalies by unified score (highest first)
 */
export function sortAnomaliesByScore(anomalies: Anomaly[]): Anomaly[] {
  return [...anomalies].sort((a, b) => b.unified_score - a.unified_score);
}

/**
 * Create a standard dataset profile
 */
export function createDatasetProfile(
  rows: number,
  columns: number,
  entityKeys: string[] = ['category']
): any {
  return {
    rows,
    columns,
    primary_keys: ['id'],
    entity_keys: entityKeys,
    time_key: 'timestamp',
    currency: 'USD'
  };
}