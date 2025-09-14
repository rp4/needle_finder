import type { SimplifiedDataset } from './schemas';

const categories = [
  'Unusual Transaction Pattern',
  'Duplicate Entry',
  'Data Quality Issue',
  'Statistical Outlier',
  'Time Series Anomaly',
  'Entity Behavior Change',
  'Seasonal Pattern Break',
  'Correlation Anomaly',
  'Missing Expected Data',
  'Volume Spike'
];

const detectionMethods = [
  'Isolation Forest',
  'Local Outlier Factor',
  'One-Class SVM',
  'DBSCAN',
  'Autoencoder',
  'Statistical Z-Score',
  'Time Series Decomposition',
  'Ensemble Method'
];

const explanations = [
  'Transaction amount exceeds historical average by 5x standard deviations',
  'Pattern significantly deviates from peer group behavior',
  'Unexpected spike detected outside of seasonal norms',
  'Multiple duplicate entries found within same time window',
  'Missing required data fields for critical validation',
  'Volume increased by 300% compared to trailing 30-day average',
  'Correlation with related metrics broken unexpectedly',
  'Entity showing unusual activity pattern not seen in training data',
  'Statistical properties indicate data quality degradation',
  'Time series forecast error exceeds confidence interval by 3x'
];

function generateSimplifiedAnomaly(index: number) {
  const score = Math.random();
  const severity = score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low';

  return {
    id: `ANM-${String(index + 1).padStart(6, '0')}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    severity,
    anomaly_score: Number(score.toFixed(3)),
    detection_method: detectionMethods[Math.floor(Math.random() * detectionMethods.length)],
    ai_explanation: explanations[Math.floor(Math.random() * explanations.length)]
  };
}

export function generateMockDataset(): SimplifiedDataset {
  const numAnomalies = 250;
  const totalRecords = 50000;

  // Generate anomalies
  const anomalies = Array.from({ length: numAnomalies }, (_, i) =>
    generateSimplifiedAnomaly(i)
  );

  // Sort by score (highest first)
  anomalies.sort((a, b) => b.anomaly_score - a.anomaly_score);

  return {
    total_records: totalRecords,
    anomalies_detected: numAnomalies,
    anomalies
  };
}

// For backward compatibility with existing code that expects AnomalyDataset
export function generateMockDatasetAsAnomalyDataset() {
  const simplified = generateMockDataset();
  const now = new Date().toISOString();

  // Convert to internal format
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
    groups: [],
    timeseries: [],
    _index: new Map(anomalies.map((a: any, idx: number) => [a.id, idx]))
  };
}