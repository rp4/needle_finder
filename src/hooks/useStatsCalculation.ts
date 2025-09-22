import { useMemo } from 'react';
import { BarChart2, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AnomalyDataset } from '@/types/anomaly.types';

export const useStatsCalculation = (
  dataset: AnomalyDataset | null,
  activeAnomalies: any[],
  confirmedAnomaliesCount: number
) => {
  return useMemo(() => [
    {
      title: 'Total Records',
      value: dataset?.dataset_profile?.rows || 0,
      icon: BarChart2,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Anomalies Detected',
      value: activeAnomalies.length,
      icon: Search,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'High Severity',
      value: activeAnomalies.filter(a => a.severity > 0.7).length,
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
    },
    {
      title: 'Confirmed Anomalies',
      value: confirmedAnomaliesCount,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
    },
  ], [dataset?.dataset_profile?.rows, activeAnomalies.length, confirmedAnomaliesCount]);
};