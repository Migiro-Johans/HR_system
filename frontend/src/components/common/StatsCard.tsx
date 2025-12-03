import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor = 'bg-primary-500',
}: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p
              className={`mt-2 text-sm ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={`${iconColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
