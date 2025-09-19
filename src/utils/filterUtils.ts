import type { Anomaly } from '@/types/anomaly.types';
import { SEVERITY_THRESHOLDS, getSeverityLevel, getAnomalyCategory } from './anomalyUtils';

export type FilterMode = 'all' | 'confirmed' | 'high-severity' | 'unreviewed';
export type SeverityLevel = 'all' | 'high' | 'medium' | 'low';
export type ReviewStatus = 'all' | 'confirmed' | 'rejected' | 'unreviewed';

export interface FilterOptions {
  mode?: FilterMode;
  severity?: SeverityLevel;
  category?: string;
  status?: ReviewStatus;
  searchTerm?: string;
}

/**
 * Filter anomalies by severity level
 */
export function filterBySeverity(
  anomalies: Anomaly[],
  level: SeverityLevel
): Anomaly[] {
  if (level === 'all') return anomalies;

  return anomalies.filter(anomaly => {
    const severityLevel = getSeverityLevel(anomaly.severity);
    return severityLevel === level;
  });
}

/**
 * Filter anomalies by review status
 */
export function filterByStatus(
  anomalies: Anomaly[],
  reviewedAnomalies: Record<string, 'confirmed' | 'rejected'>,
  status: ReviewStatus
): Anomaly[] {
  if (status === 'all') return anomalies;

  return anomalies.filter(anomaly => {
    const reviewStatus = reviewedAnomalies[anomaly.id];

    if (status === 'unreviewed') return !reviewStatus;
    if (status === 'confirmed') return reviewStatus === 'confirmed';
    if (status === 'rejected') return reviewStatus === 'rejected';

    return true;
  });
}

/**
 * Filter anomalies by category
 */
export function filterByCategory(
  anomalies: Anomaly[],
  category: string | null
): Anomaly[] {
  if (!category) return anomalies;

  return anomalies.filter(anomaly => {
    const anomalyCategory = getAnomalyCategory(anomaly);
    return anomalyCategory === category;
  });
}

/**
 * Filter anomalies by search term
 */
export function filterBySearchTerm(
  anomalies: Anomaly[],
  searchTerm: string
): Anomaly[] {
  if (!searchTerm) return anomalies;

  const term = searchTerm.toLowerCase();

  return anomalies.filter(anomaly => {
    // Search in ID
    if (anomaly.id.toLowerCase().includes(term)) return true;

    // Search in category
    const category = getAnomalyCategory(anomaly);
    if (category.toLowerCase().includes(term)) return true;

    // Search in reason text
    const reasonText = anomaly.reason_codes?.[0]?.text || '';
    if (reasonText.toLowerCase().includes(term)) return true;

    // Search in custom fields
    if (anomaly.customFields) {
      const customFieldValues = Object.values(anomaly.customFields)
        .map(v => String(v).toLowerCase())
        .join(' ');
      if (customFieldValues.includes(term)) return true;
    }

    return false;
  });
}

/**
 * Apply multiple filters to anomalies
 */
export function applyFilters(
  anomalies: Anomaly[],
  options: FilterOptions & { reviewedAnomalies?: Record<string, 'confirmed' | 'rejected'> }
): Anomaly[] {
  let filtered = anomalies;

  // Apply filter mode
  if (options.mode && options.mode !== 'all') {
    if (options.mode === 'confirmed' && options.reviewedAnomalies) {
      filtered = filterByStatus(filtered, options.reviewedAnomalies, 'confirmed');
    } else if (options.mode === 'high-severity') {
      filtered = filtered.filter(a => a.severity > SEVERITY_THRESHOLDS.HIGH);
    } else if (options.mode === 'unreviewed' && options.reviewedAnomalies) {
      filtered = filterByStatus(filtered, options.reviewedAnomalies, 'unreviewed');
    }
  }

  // Apply severity filter
  if (options.severity && options.severity !== 'all') {
    filtered = filterBySeverity(filtered, options.severity);
  }

  // Apply category filter
  if (options.category) {
    filtered = filterByCategory(filtered, options.category);
  }

  // Apply status filter
  if (options.status && options.status !== 'all' && options.reviewedAnomalies) {
    filtered = filterByStatus(filtered, options.reviewedAnomalies, options.status);
  }

  // Apply search term filter
  if (options.searchTerm) {
    filtered = filterBySearchTerm(filtered, options.searchTerm);
  }

  return filtered;
}