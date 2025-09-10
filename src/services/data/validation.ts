// Type import used for validation logic

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDataset(data: any): ValidationResult {
  const errors: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid data format: expected JSON object'] };
  }

  // Required top-level fields
  const requiredFields = ['run_id', 'dataset_profile', 'anomalies'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate dataset_profile
  if (data.dataset_profile) {
    const profileFields = ['rows', 'columns', 'primary_keys', 'entity_keys', 'time_key', 'currency'];
    for (const field of profileFields) {
      if (!(field in data.dataset_profile)) {
        errors.push(`Missing dataset_profile.${field}`);
      }
    }
    
    if (typeof data.dataset_profile.rows !== 'number' || data.dataset_profile.rows < 0) {
      errors.push('dataset_profile.rows must be a non-negative number');
    }
    
    if (typeof data.dataset_profile.columns !== 'number' || data.dataset_profile.columns < 0) {
      errors.push('dataset_profile.columns must be a non-negative number');
    }
  }

  // Validate anomalies array
  if (data.anomalies) {
    if (!Array.isArray(data.anomalies)) {
      errors.push('anomalies must be an array');
    } else {
      // Check first 10 anomalies for structure
      const sampleSize = Math.min(10, data.anomalies.length);
      for (let i = 0; i < sampleSize; i++) {
        const anomaly = data.anomalies[i];
        
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
  if (data.groups && !Array.isArray(data.groups)) {
    errors.push('groups must be an array if present');
  }

  // Validate timeseries if present
  if (data.timeseries && !Array.isArray(data.timeseries)) {
    errors.push('timeseries must be an array if present');
  }

  // Validate data_quality if present
  if (data.data_quality && !Array.isArray(data.data_quality)) {
    errors.push('data_quality must be an array if present');
  }

  return {
    valid: errors.length === 0,
    errors: errors.slice(0, 10) // Limit to first 10 errors
  };
}