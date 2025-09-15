import type { SimplifiedDataset } from './schemas';
import { parseCSV } from './csvParser';
import { getSampleCSVData } from './sampleData';

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
    category: categories[Math.floor(Math.random() * categories.length)] || 'Unknown Category',
    severity: severity as 'high' | 'medium' | 'low',
    anomaly_score: Number(score.toFixed(3)),
    detection_method: detectionMethods[Math.floor(Math.random() * detectionMethods.length)] || 'Unknown Method',
    ai_explanation: explanations[Math.floor(Math.random() * explanations.length)] || 'No explanation available'
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
  // Get the complete sample CSV data (50 rows for demo)
  const csvData = getSampleCSVData();

  // Parse the CSV data
  const rows = parseCSV(csvData);
  const now = new Date().toISOString();

  // Extract custom field names (all fields except the required ones)
  const requiredFields = ['id', 'category', 'severity', 'anomaly_score', 'detection_method', 'ai_explanation'];
  const firstRow = rows[0];
  if (!firstRow) {
    throw new Error('No data rows generated');
  }
  const customFieldNames = Object.keys(firstRow).filter(key => !requiredFields.includes(key));

  // Convert to internal format with custom fields
  const anomalies = rows.map((row: any) => {
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
      // Include custom fields for display
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined
    };
  });

  // Sort by score (highest first)
  anomalies.sort((a: any, b: any) => b.unified_score - a.unified_score);

  return {
    run_id: now,
    dataset_profile: {
      rows: 50000, // Simulated total records
      columns: Object.keys(firstRow).length,
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