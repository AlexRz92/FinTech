import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value?: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  children?: ReactNode;
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  children,
}: DashboardCardProps) {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          {value && (
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
          )}
          {subtitle && (
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl border border-blue-500/20">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
        )}
      </div>

      {trendValue && (
        <div className={`text-sm font-medium ${trendColor}`}>
          {trendValue}
        </div>
      )}

      {children}
    </div>
  );
}
