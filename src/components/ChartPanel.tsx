import React from 'react';

interface ChartDataPoint {
  week: string;
  adminCapital: number;
  userCapital: number;
}

interface ChartPanelProps {
  data: ChartDataPoint[];
  title: string;
}

export default function ChartPanel({ data, title }: ChartPanelProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">Sin datos</div>;
  }

  const maxValue = Math.max(...data.flatMap(d => [d.adminCapital, d.userCapital]));
  const minValue = Math.min(...data.flatMap(d => [d.adminCapital, d.userCapital]));
  const range = maxValue - minValue;

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="card-fintage rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

      <div className="flex items-end gap-2 h-64 justify-between">
        {data.map((point, idx) => {
          const adminHeight = ((point.adminCapital - minValue) / range) * 100;
          const userHeight = ((point.userCapital - minValue) / range) * 100;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex gap-1 items-end h-48">
                <div
                  className="w-1/2 bg-blue-500 rounded-t-lg transition-all"
                  style={{ height: `${adminHeight}%` }}
                  title={`Admin: ${formatCurrency(point.adminCapital)}`}
                />
                <div
                  className="w-1/2 bg-emerald-500 rounded-t-lg transition-all"
                  style={{ height: `${userHeight}%` }}
                  title={`User: ${formatCurrency(point.userCapital)}`}
                />
              </div>
              <span className="text-xs font-medium text-gray-400">{point.week}</span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-6 justify-center mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-300">Capital Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-gray-300">Capital User</span>
        </div>
      </div>
    </div>
  );
}
