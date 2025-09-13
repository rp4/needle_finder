import { z } from 'zod';

// Dataset validation schemas
export const DatasetProfileSchema = z.object({
  rows: z.number().min(0),
  columns: z.number().min(0),
  primary_keys: z.array(z.string()),
  entity_keys: z.array(z.string()),
  time_key: z.string(),
  currency: z.string()
});

export const ModelVoteSchema = z.object({
  model: z.string(),
  score: z.number().min(0).max(1)
});

export const ReasonCodeSchema = z.object({
  code: z.string(),
  text: z.string()
});

export const ShapValueSchema = z.object({
  feature: z.string(),
  value: z.number(),
  shap: z.number()
});

export const FeatureDeltaSchema = z.object({
  feature: z.string(),
  subject: z.number(),
  peer_p50: z.number(),
  z_robust: z.number()
});

export const CounterfactualSuggestionSchema = z.object({
  feature: z.string(),
  target: z.number(),
  predicted_unified_score: z.number()
});

export const AnomalyExplanationsSchema = z.object({
  shap_local: z.array(ShapValueSchema).optional(),
  feature_deltas: z.array(FeatureDeltaSchema).optional(),
  counterfactual_suggestions: z.array(CounterfactualSuggestionSchema).optional()
});

export const AnomalyLinksSchema = z.object({
  raw_record_uri: z.string().optional(),
  lineage: z.object({
    source: z.string(),
    ingested_at: z.string()
  }).optional()
});

export const AnomalyCaseSchema = z.object({
  status: z.enum(['open', 'closed', 'expected']),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const AnomalySchema = z.object({
  id: z.string(),
  subject_type: z.enum(['transaction', 'entity', 'group', 'sequence']),
  subject_id: z.string(),
  timestamp: z.string(),
  anomaly_types: z.array(z.enum(['point', 'contextual', 'collective', 'group', 'timeseries'])),
  severity: z.number().min(0).max(1),
  materiality: z.number().min(0).max(1),
  unified_score: z.number().min(0).max(1),
  model_votes: z.array(ModelVoteSchema).optional(),
  reason_codes: z.array(ReasonCodeSchema).optional(),
  explanations: AnomalyExplanationsSchema.optional(),
  links: AnomalyLinksSchema.optional(),
  case: AnomalyCaseSchema.optional(),
  features: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

export const GroupAnomalySchema = z.object({
  group_key: z.record(z.string()),
  population: z.number().min(0),
  divergence: z.object({
    metric: z.enum(['energy_distance', 'mmd', 'psi']),
    score: z.number().min(0).max(1),
    peer: z.string().optional()
  }).optional(),
  top_drivers: z.array(z.object({
    feature: z.string(),
    delta_pp: z.number()
  })).optional()
});

export const TimeSeriesPointSchema = z.object({
  t: z.string(),
  y: z.number(),
  y_hat: z.number().optional(),
  resid_z: z.number().optional(),
  labels: z.array(z.enum(['spike', 'shift', 'variance'])).optional()
});

export const TimeSeriesSchema = z.object({
  metric: z.string(),
  entity_scope: z.string().optional(),
  bucket: z.enum(['hour', 'day', 'week']),
  points: z.array(TimeSeriesPointSchema)
});

export const ClusterMemberSchema = z.object({
  id: z.string(),
  cluster_id: z.string(),
  prob: z.number().min(0).max(1),
  glosh: z.number()
});

export const ClustersSchema = z.object({
  algo: z.string(),
  params: z.record(z.union([z.string(), z.number(), z.boolean()])),
  tree: z.string().optional(),
  members: z.array(ClusterMemberSchema)
});

export const DataQualityIssueSchema = z.object({
  issue: z.enum(['missing', 'duplicate', 'schema_change', 'clock_skew']),
  detail: z.string(),
  t: z.string()
});

export const AnomalyDatasetSchema = z.object({
  run_id: z.string(),
  dataset_profile: DatasetProfileSchema,
  anomalies: z.array(AnomalySchema).min(1),
  groups: z.array(GroupAnomalySchema).optional(),
  timeseries: z.array(TimeSeriesSchema).optional(),
  clusters: ClustersSchema.optional(),
  globals: z.object({
    shap_beeswarm_top: z.array(z.object({
      feature: z.string(),
      mean_abs_shap: z.number()
    })).optional(),
    drift: z.object({
      psi_inputs: z.record(z.number()).optional()
    }).optional()
  }).optional(),
  data_quality: z.array(DataQualityIssueSchema).optional(),
  ui_hints: z.any().optional() // Complex nested structure, kept flexible
});

// File validation
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_FILE_TYPES = ['application/json', 'text/plain', 'application/x-gzip'];

export const FileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
  ).refine(
    (file) => ALLOWED_FILE_TYPES.includes(file.type) || file.name.endsWith('.json') || file.name.endsWith('.gz'),
    'File must be JSON or GZIP format'
  )
});

export type AnomalyDataset = z.infer<typeof AnomalyDatasetSchema>;
export type Anomaly = z.infer<typeof AnomalySchema>;