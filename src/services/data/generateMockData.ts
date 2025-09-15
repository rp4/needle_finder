import type { AnomalyDataset, Anomaly } from '@/types/anomaly.types';

export function generateMockData(): AnomalyDataset {
  const methods = ['HDBSCAN', 'Isolation Forest', 'LOF', 'DBSCAN', 'One-Class SVM'];
  const anomalyTypes: Array<'point' | 'contextual' | 'collective' | 'group' | 'timeseries'> = 
    ['point', 'contextual', 'collective', 'group', 'timeseries'];
  const subjectTypes: Array<'transaction' | 'entity' | 'group' | 'sequence'> = 
    ['transaction', 'entity', 'group', 'sequence'];
  
  const anomalies: Anomaly[] = [];
  
  // Generate 50 sample anomalies
  for (let i = 0; i < 50; i++) {
    const severity = Math.random();
    const materiality = Math.random();
    const unified_score = (severity * 0.6 + materiality * 0.4);
    
    anomalies.push({
      id: `ANM-${String(i + 1).padStart(4, '0')}`,
      subject_type: subjectTypes[Math.floor(Math.random() * subjectTypes.length)] || 'transaction',
      subject_id: `SUBJ-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      anomaly_types: [anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)] || 'point'],
      severity,
      materiality,
      unified_score,
      model_votes: methods.slice(0, Math.floor(Math.random() * 3) + 1).map(model => ({
        model,
        score: Math.random()
      })),
      reason_codes: [
        {
          code: `RC${String(i + 1).padStart(3, '0')}`,
          text: `Unusual pattern detected in ${anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)]} analysis`
        }
      ],
      explanations: {
        shap_local: [
          { feature: 'Transaction Amount', value: Math.random() * 10000, shap: Math.random() * 0.5 },
          { feature: 'Time Delta', value: Math.random() * 100, shap: Math.random() * 0.3 },
          { feature: 'User Behavior', value: Math.random() * 50, shap: Math.random() * 0.2 },
        ],
        feature_deltas: [
          { feature: 'Amount', subject: Math.random() * 1000, peer_p50: Math.random() * 500, z_robust: Math.random() * 3 },
          { feature: 'Frequency', subject: Math.random() * 10, peer_p50: Math.random() * 5, z_robust: Math.random() * 2 },
        ]
      },
      case: {
        status: Math.random() > 0.7 ? 'closed' : Math.random() > 0.3 ? 'open' : 'expected',
        tags: ['review', 'audit', 'Q4-2024']
      }
    });
  }
  
  // Sort by unified score (highest first)
  anomalies.sort((a, b) => b.unified_score - a.unified_score);
  
  return {
    run_id: `RUN-${Date.now()}`,
    dataset_profile: {
      rows: 10000,
      columns: 25,
      primary_keys: ['transaction_id'],
      entity_keys: ['user_id', 'account_id'],
      time_key: 'timestamp',
      currency: 'USD'
    },
    anomalies,
    globals: {
      shap_beeswarm_top: [
        { feature: 'Transaction Amount', mean_abs_shap: 0.42 },
        { feature: 'Time Delta', mean_abs_shap: 0.31 },
        { feature: 'User Behavior', mean_abs_shap: 0.18 },
        { feature: 'Location', mean_abs_shap: 0.09 }
      ]
    },
    ui_hints: {
      pii_masked_fields: ['user_name', 'account_number', 'email'],
      confidence_ribbon: 0.85
    }
  };
}