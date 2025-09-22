import { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  isActive: boolean;
  borderColor: string;
  onClick?: () => void;
}

export const StatsCard = memo(function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  isActive,
  borderColor,
  onClick
}: StatsCardProps) {
  return (
    <div
      className={`backdrop-blur-xs border rounded-xl p-4 transition-all shadow-lg cursor-pointer ${
        isActive
          ? `${borderColor} border-2 bg-white/95 hover:bg-white`
          : 'border-gray-200 bg-white/70 hover:bg-white/85'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
});