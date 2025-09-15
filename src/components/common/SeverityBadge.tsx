import { getSeverityBadgeClass, getSeverityLabel } from '@/utils/anomalyUtils';

interface SeverityBadgeProps {
  severity: number;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${getSeverityBadgeClass(severity)} ${className}`}
    >
      {getSeverityLabel(severity)}
    </span>
  );
}