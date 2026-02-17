import { LucideIcon } from 'lucide-react';

interface CardMetricProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function CardMetric({ title, value, icon: Icon, trend, subtitle }: CardMetricProps) {
  const isGoldMetric = title.includes('HWM') || title.includes('Performance Fee') || subtitle?.includes('High Water Mark');

  return (
    <div className="card-fintage rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${isGoldMetric ? 'text-fintage-gold' : 'text-white'}`}>{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${isGoldMetric ? 'text-fintage-gold text-opacity-70' : 'text-gray-400'}`}>{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs semana anterior</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isGoldMetric ? 'bg-yellow-900 bg-opacity-20' : 'bg-blue-600 bg-opacity-20'}`}>
            <Icon className={`w-6 h-6 ${isGoldMetric ? 'text-fintage-gold' : 'text-blue-400'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
