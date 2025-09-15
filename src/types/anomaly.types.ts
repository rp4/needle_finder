export interface DatasetProfile {
  rows: number;
  columns: number;
  primary_keys: string[];
  entity_keys: string[];
  time_key: string;
  currency: string;
}

export interface ModelVote {
  model: string;
  score: number;
}

export interface ReasonCode {
  code: string;
  text: string;
}

export interface ShapValue {
  feature: string;
  value: number;
  shap: number;
}

export interface FeatureDelta {
  feature: string;
  subject: number;
  peer_p50: number;
  z_robust: number;
}

export interface CounterfactualSuggestion {
  feature: string;
  target: number;
  predicted_unified_score: number;
}

export interface AnomalyExplanations {
  shap_local?: ShapValue[];
  feature_deltas?: FeatureDelta[];
  counterfactual_suggestions?: CounterfactualSuggestion[];
}

export interface AnomalyLinks {
  raw_record_uri?: string;
  lineage?: {
    source: string;
    ingested_at: string;
  };
}

export interface AnomalyCase {
  status: 'open' | 'closed' | 'expected';
  assignee?: string;
  tags?: string[];
}

export interface Anomaly {
  id: string;
  subject_type: 'transaction' | 'entity' | 'group' | 'sequence';
  subject_id: string;
  timestamp: string;
  anomaly_types: ('point' | 'contextual' | 'collective' | 'group' | 'timeseries')[];
  severity: number;
  materiality: number;
  unified_score: number;
  model_votes?: ModelVote[];
  reason_codes?: ReasonCode[];
  explanations?: AnomalyExplanations;
  links?: AnomalyLinks;
  case?: AnomalyCase;
  features?: Record<string, string | number | boolean>;
  customFields?: Record<string, any>; // Store additional columns from CSV
}

export interface GroupAnomaly {
  group_key: Record<string, string>;
  population: number;
  divergence?: {
    metric: 'energy_distance' | 'mmd' | 'psi';
    score: number;
    peer?: string;
  };
  top_drivers?: Array<{
    feature: string;
    delta_pp: number;
  }>;
}

export interface TimeSeriesPoint {
  t: string;
  y: number;
  y_hat?: number;
  resid_z?: number;
  labels?: ('spike' | 'shift' | 'variance')[];
}

export interface TimeSeries {
  metric: string;
  entity_scope?: string;
  bucket: 'hour' | 'day' | 'week';
  points: TimeSeriesPoint[];
}

export interface ClusterMember {
  id: string;
  cluster_id: string;
  prob: number;
  glosh: number;
}

export interface Clusters {
  algo: string;
  params: Record<string, string | number | boolean>;
  tree?: string;
  members: ClusterMember[];
}

export interface DataQualityIssue {
  issue: 'missing' | 'duplicate' | 'schema_change' | 'clock_skew';
  detail: string;
  t: string;
}

export interface UIHints {
  reason_cards?: Array<{
    code: string;
    text: string;
    baseline_pctl?: number;
    peer?: string;
  }>;
  confidence_ribbon?: number;
  sequence_domino?: string[];
  pii_masked_fields?: string[];
  mosaic_shap?: ShapValue[];
  peer_mirror?: {
    feature: string;
    subject: number;
    peer_p50: number;
    peer_iqr: [number, number];
  };
  counterfactual?: CounterfactualSuggestion[];
  drift_pins?: Array<{
    metric: string;
    t: string;
    value: number;
    note?: string;
  }>;
}

export interface AnomalyDataset {
  run_id: string;
  dataset_profile: DatasetProfile;
  anomalies: Anomaly[];
  groups?: GroupAnomaly[];
  timeseries?: TimeSeries[];
  clusters?: Clusters;
  globals?: {
    shap_beeswarm_top?: Array<{
      feature: string;
      mean_abs_shap: number;
    }>;
    drift?: {
      psi_inputs?: Record<string, number>;
    };
  };
  data_quality?: DataQualityIssue[];
  ui_hints?: UIHints;
}