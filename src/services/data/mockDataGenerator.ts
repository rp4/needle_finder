import type { AnomalyDataset } from '@/types/anomaly.types';

const farmEntities = [
  'BARN-001', 'SILO-042', 'FIELD-NORTH-7', 'TRACTOR-JOHN-3', 'HARVEST-BATCH-89',
  'CORN-LOT-456', 'WHEAT-SECTION-12', 'DAIRY-UNIT-5', 'POULTRY-HOUSE-3', 'ORCHARD-WEST-2',
  'GREENHOUSE-A1', 'IRRIGATION-ZONE-9', 'STORAGE-SHED-6', 'MILL-GRAIN-001', 'PASTURE-SOUTH-4'
];

const farmFeatures = [
  'yield_per_acre', 'moisture_content', 'seed_quality', 'fertilizer_usage', 'irrigation_hours',
  'harvest_weight', 'storage_temperature', 'equipment_hours', 'labor_cost', 'weather_index',
  'soil_ph', 'pest_damage_score', 'organic_certification', 'market_price', 'transportation_cost'
];

const anomalyReasons = [
  { code: 'YIELD_SPIKE', text: 'Yield exceeded expected range by 45% compared to historical average' },
  { code: 'MOISTURE_ANOMALY', text: 'Moisture content significantly below seasonal norms' },
  { code: 'COST_OUTLIER', text: 'Operating costs 3 standard deviations above peer farms' },
  { code: 'PATTERN_BREAK', text: 'Harvest pattern deviates from established seasonal cycle' },
  { code: 'EQUIPMENT_IRREGULAR', text: 'Equipment usage patterns suggest maintenance issues' },
  { code: 'QUALITY_DRIFT', text: 'Product quality metrics showing gradual decline over time' },
  { code: 'INVENTORY_MISMATCH', text: 'Storage levels inconsistent with reported harvest volumes' },
  { code: 'WEATHER_IMPACT', text: 'Unusual correlation between weather events and output' }
];

const dataQualityIssues = [
  { issue: 'missing', detail: 'Temperature readings missing for storage units 3-5' },
  { issue: 'duplicate', detail: 'Duplicate harvest entries found for Field North-7' },
  { issue: 'clock_skew', detail: 'Timestamps offset by 6 hours in irrigation system logs' },
  { issue: 'schema_change', detail: 'New moisture sensor format detected after maintenance' }
];

function generateRandomDate(daysBack: number = 90): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

function generateShapValues(): any[] {
  return farmFeatures
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .map(feature => ({
      feature,
      value: Math.random() * 100,
      shap: (Math.random() - 0.5) * 2
    }));
}

function generateFeatureDeltas(): any[] {
  return farmFeatures
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .map(feature => ({
      feature,
      subject: Math.random() * 100,
      peer_p50: Math.random() * 100,
      z_robust: (Math.random() - 0.5) * 6
    }));
}

export function generateMockDataset(): AnomalyDataset {
  const numAnomalies = 250;
  const numGroups = 12;
  const numTimeSeries = 4;
  
  // Generate anomalies
  const anomalies = Array.from({ length: numAnomalies }, (_, i) => {
    const severity = Math.random();
    const materiality = Math.random();
    const unified_score = (severity * 0.6 + materiality * 0.4) * (0.8 + Math.random() * 0.2);
    
    return {
      id: `ANM-${String(i + 1).padStart(6, '0')}`,
      subject_type: ['transaction', 'entity', 'group', 'sequence'][Math.floor(Math.random() * 4)] as any,
      subject_id: farmEntities[Math.floor(Math.random() * farmEntities.length)],
      timestamp: generateRandomDate(),
      anomaly_types: ['point', 'contextual', 'collective'].filter(() => Math.random() > 0.5) as any,
      severity,
      materiality,
      unified_score: Math.min(1, unified_score),
      model_votes: [
        { model: 'isolation_forest', score: Math.random() },
        { model: 'local_outlier_factor', score: Math.random() },
        { model: 'one_class_svm', score: Math.random() }
      ],
      reason_codes: anomalyReasons
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.ceil(Math.random() * 3) + 1),
      explanations: {
        shap_local: generateShapValues(),
        feature_deltas: generateFeatureDeltas(),
        counterfactual_suggestions: [
          {
            feature: farmFeatures[Math.floor(Math.random() * farmFeatures.length)],
            target: Math.random() * 100,
            predicted_unified_score: Math.random() * 0.3
          }
        ]
      },
      links: {
        raw_record_uri: `farm://records/${Date.now()}-${i}`,
        lineage: {
          source: 'farm_management_system_v2.3',
          ingested_at: generateRandomDate(7)
        }
      },
      case: {
        status: (Math.random() > 0.7 ? 'closed' : 'open') as 'open' | 'closed',
        tags: ['seasonal', 'weather-related', 'equipment', 'market-driven']
          .filter(() => Math.random() > 0.6)
      }
    };
  });

  // Generate groups
  const groups = Array.from({ length: numGroups }, (_, i) => ({
    group_key: {
      region: ['North Fields', 'South Fields', 'East Orchards', 'West Pastures'][i % 4],
      crop_type: ['Corn', 'Wheat', 'Soybeans', 'Barley'][Math.floor(i / 3) % 4]
    },
    population: Math.floor(Math.random() * 5000) + 1000,
    divergence: {
      metric: ['energy_distance', 'mmd', 'psi'][Math.floor(Math.random() * 3)] as any,
      score: Math.random(),
      peer: `REGION-${Math.floor(Math.random() * 10)}`
    },
    top_drivers: farmFeatures
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map(feature => ({
        feature,
        delta_pp: (Math.random() - 0.5) * 0.4
      }))
  }));

  // Generate time series
  const timeseries = Array.from({ length: numTimeSeries }, (_, i) => {
    const numPoints = 30;
    const baseValue = Math.random() * 1000 + 500;
    
    return {
      metric: ['harvest_volume', 'equipment_hours', 'labor_cost', 'storage_capacity'][i],
      entity_scope: farmEntities[Math.floor(Math.random() * farmEntities.length)],
      bucket: 'day' as const,
      points: Array.from({ length: numPoints }, (_, j) => {
        const date = new Date();
        date.setDate(date.getDate() - (numPoints - j));
        const y = baseValue + (Math.random() - 0.5) * 200 + Math.sin(j / 5) * 100;
        const y_hat = baseValue + Math.sin(j / 5) * 80;
        const resid_z = (y - y_hat) / 50;
        
        return {
          t: date.toISOString(),
          y,
          y_hat,
          resid_z,
          labels: Math.abs(resid_z) > 2 ? (['spike'] as ('spike' | 'shift' | 'variance')[]) : undefined
        };
      })
    };
  });

  // Generate clusters
  const clusters = {
    algo: 'hdbscan',
    params: { min_cluster_size: 5, min_samples: 3 },
    tree: 'dendogram_placeholder',
    members: anomalies.slice(0, 100).map((a, i) => ({
      id: a.id,
      cluster_id: `c_${Math.floor(i / 20)}`,
      prob: Math.random(),
      glosh: Math.random()
    }))
  };

  // Generate mock dataset
  const mockDataset: AnomalyDataset = {
    run_id: new Date().toISOString(),
    dataset_profile: {
      rows: 50000,
      columns: 47,
      primary_keys: ['transaction_id', 'timestamp'],
      entity_keys: ['farm_unit', 'crop_type', 'region'],
      time_key: 'timestamp',
      currency: 'USD'
    },
    anomalies,
    groups,
    timeseries,
    clusters,
    globals: {
      shap_beeswarm_top: farmFeatures
        .map(feature => ({
          feature,
          mean_abs_shap: Math.random()
        }))
        .sort((a, b) => b.mean_abs_shap - a.mean_abs_shap)
        .slice(0, 10),
      drift: {
        psi_inputs: Object.fromEntries(
          farmFeatures.slice(0, 8).map(f => [f, Math.random() * 0.5])
        )
      }
    },
    data_quality: dataQualityIssues.map(issue => ({
      ...issue,
      issue: issue.issue as any,
      t: generateRandomDate(30)
    })),
    ui_hints: {
      reason_cards: anomalyReasons.slice(0, 5).map(r => ({
        ...r,
        baseline_pctl: Math.random() * 100,
        peer: farmEntities[Math.floor(Math.random() * farmEntities.length)]
      })),
      confidence_ribbon: 0.85,
      sequence_domino: ['planting', 'growing', 'harvesting', 'storage', 'distribution'],
      pii_masked_fields: ['owner_name', 'farm_address', 'bank_account'],
      drift_pins: [
        {
          metric: 'psi_yield',
          t: generateRandomDate(60),
          value: 0.342,
          note: 'Significant shift after drought period'
        },
        {
          metric: 'psi_moisture',
          t: generateRandomDate(30),
          value: 0.256,
          note: 'New irrigation system installed'
        }
      ]
    }
  };

  return mockDataset;
}