// Type import used for validation logic

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDataset(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Invalid data format: expected JSON object'] };
  }

  const dataset = data as Record<string, any>;

  // Required top-level fields
  const requiredFields = ['run_id', 'dataset_profile', 'anomalies'];
  for (const field of requiredFields) {
    if (!(field in dataset)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate dataset_profile
  if (dataset.dataset_profile) {
    const profileFields = ['rows', 'columns', 'primary_keys', 'entity_keys', 'time_key', 'currency'];
    for (const field of profileFields) {
      if (!(field in dataset.dataset_profile)) {
        errors.push(`Missing dataset_profile.${field}`);
      }
    }
    
    if (typeof dataset.dataset_profile.rows !== 'number' || dataset.dataset_profile.rows < 0) {
      errors.push('dataset_profile.rows must be a non-negative number');
    }
    
    if (typeof dataset.dataset_profile.columns !== 'number' || dataset.dataset_profile.columns < 0) {
      errors.push('dataset_profile.columns must be a non-negative number');
    }
  }

  // Validate anomalies array
  if (dataset.anomalies) {
    if (!Array.isArray(dataset.anomalies)) {
      errors.push('anomalies must be an array');
    } else {
      // Check first 10 anomalies for structure
      const sampleSize = Math.min(10, dataset.anomalies.length);
      for (let i = 0; i < sampleSize; i++) {
        const anomaly = dataset.anomalies[i];
        
        if (!anomaly.id) {
          errors.push(`Anomaly at index ${i} missing required field: id`);
        }
        
        if (!anomaly.subject_type) {
          errors.push(`Anomaly at index ${i} missing required field: subject_type`);
        } else if (!['transaction', 'entity', 'group', 'sequence'].includes(anomaly.subject_type)) {
          errors.push(`Anomaly at index ${i} has invalid subject_type: ${anomaly.subject_type}`);
        }
        
        if (!anomaly.timestamp) {
          errors.push(`Anomaly at index ${i} missing required field: timestamp`);
        } else if (isNaN(Date.parse(anomaly.timestamp))) {
          errors.push(`Anomaly at index ${i} has invalid timestamp: ${anomaly.timestamp}`);
        }
        
        if (typeof anomaly.severity !== 'number' || anomaly.severity < 0 || anomaly.severity > 1) {
          errors.push(`Anomaly at index ${i} severity must be a number between 0 and 1`);
        }
        
        if (typeof anomaly.unified_score !== 'number' || anomaly.unified_score < 0 || anomaly.unified_score > 1) {
          errors.push(`Anomaly at index ${i} unified_score must be a number between 0 and 1`);
        }
      }
    }
  }

  // Validate groups if present
  if (dataset.groups && !Array.isArray(dataset.groups)) {
    errors.push('groups must be an array if present');
  }

  // Validate timeseries if present
  if (dataset.timeseries && !Array.isArray(dataset.timeseries)) {
    errors.push('timeseries must be an array if present');
  }

  // Validate data_quality if present
  if (dataset.data_quality && !Array.isArray(dataset.data_quality)) {
    errors.push('data_quality must be an array if present');
  }

  return {
    valid: errors.length === 0,
    errors: errors.slice(0, 10) // Limit to first 10 errors
  };
}