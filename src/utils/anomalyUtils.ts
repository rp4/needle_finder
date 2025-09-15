import type { Anomaly } from '@/types/anomaly.types';

// Severity thresholds
export const SEVERITY_THRESHOLDS = {
  HIGH: 0.7,
  MEDIUM: 0.4,
} as const;

// Get severity level from numeric value
export function getSeverityLevel(severity: number): 'high' | 'medium' | 'low' {
  if (severity > SEVERITY_THRESHOLDS.HIGH) return 'high';
  if (severity > SEVERITY_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

// Get severity badge CSS classes
export function getSeverityBadgeClass(severity: number): string {
  if (severity > SEVERITY_THRESHOLDS.HIGH) {
    return 'bg-red-500/20 text-red-400 border border-red-500/50';
  }
  if (severity > SEVERITY_THRESHOLDS.MEDIUM) {
    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50';
  }
  return 'bg-green-500/20 text-green-400 border border-green-500/50';
}

// Get severity label text
export function getSeverityLabel(severity: number): string {
  const level = getSeverityLevel(severity);
  return level.toUpperCase();
}

// Get anomaly category from anomaly object
export function getAnomalyCategory(anomaly: Anomaly): string {
  // First try to get from reason codes
  if (anomaly.reason_codes?.[0]?.code) {
    return anomaly.reason_codes[0].code
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  // Fall back to anomaly types
  return anomaly.anomaly_types?.[0] || 'Unknown';
}

// Format anomaly ID for display (shortened version)
export function formatAnomalyId(id: string, length: number = 8): string {
  if (id.length <= length) return id;
  return `${id.slice(0, length)}...`;
}