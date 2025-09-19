import type { Anomaly } from '@/types/anomaly.types';
import { getAnomalyCategory } from './anomalyUtils';

export type SortField = 'score' | 'severity' | 'category' | 'id' | 'timestamp';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

/**
 * Sort anomalies by specified field and direction
 */
export function sortAnomalies(
  anomalies: Anomaly[],
  options: SortOptions
): Anomaly[] {
  const { field, direction } = options;
  const sorted = [...anomalies];

  sorted.sort((a, b) => {
    let compareValue = 0;

    switch (field) {
      case 'score':
        compareValue = a.unified_score - b.unified_score;
        break;

      case 'severity':
        compareValue = a.severity - b.severity;
        break;

      case 'category':
        const catA = getAnomalyCategory(a);
        const catB = getAnomalyCategory(b);
        compareValue = catA.localeCompare(catB);
        break;

      case 'id':
        compareValue = a.id.localeCompare(b.id);
        break;

      case 'timestamp':
        compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;

      default:
        compareValue = 0;
    }

    return direction === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
}

/**
 * Sort anomalies with review status consideration
 * Places rejected items at the bottom, maintains order for others
 */
export function sortWithReviewStatus(
  anomalies: Anomaly[],
  reviewedAnomalies: Record<string, 'confirmed' | 'rejected'>,
  baseSort?: SortOptions
): Anomaly[] {
  const sorted = baseSort ? sortAnomalies(anomalies, baseSort) : [...anomalies];

  return sorted.sort((a, b) => {
    const aStatus = reviewedAnomalies[a.id];
    const bStatus = reviewedAnomalies[b.id];

    // False positives (rejected) go to the bottom
    if (aStatus === 'rejected' && bStatus !== 'rejected') return 1;
    if (aStatus !== 'rejected' && bStatus === 'rejected') return -1;

    // Maintain original order for other items
    return 0;
  });
}

/**
 * Get top N anomalies by score
 */
export function getTopAnomaliesByScore(
  anomalies: Anomaly[],
  count: number
): Anomaly[] {
  return sortAnomalies(anomalies, {
    field: 'score',
    direction: 'desc'
  }).slice(0, count);
}

/**
 * Group anomalies by category and sort
 */
export function groupAndSortByCategory(
  anomalies: Anomaly[]
): Map<string, Anomaly[]> {
  const grouped = new Map<string, Anomaly[]>();

  anomalies.forEach(anomaly => {
    const category = getAnomalyCategory(anomaly);
    const group = grouped.get(category) || [];
    group.push(anomaly);
    grouped.set(category, group);
  });

  // Sort each group by score
  grouped.forEach((group, category) => {
    grouped.set(
      category,
      sortAnomalies(group, { field: 'score', direction: 'desc' })
    );
  });

  return grouped;
}