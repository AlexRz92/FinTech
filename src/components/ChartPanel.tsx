import React from 'react';

interface ChartDataPoint {
  name: string;
  valor: number;
  adminCapital?: number;
  userCapital?: number;
}

interface ChartPanelProps {
  data: ChartDataPoint[];
  title: string;
}

export default function ChartPanel({ data, title }: ChartPanelProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">Sin datos</div>;
  }

  const hasDetailedData = data.some(d => d.adminCapital !== undefined && d.userCapital !== undefined);

  if (!hasDetailedData) {
    const maxValue = Math.max(...data.map(d => d.valor));
    const minValue = Math.min(...data.map(d => d.valor));
    const range = maxValue - minValue || 1;

    const formatCurrency = (value: number) => {
      return `$${(value / 1000).toFixed(0)}k`;
    };

    return (
      <div className="card-fintage rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

        <div className="flex items-end gap-2 h-64 justify-between">
          {data.map((point, idx) => {
            const height = ((point.valor - minValue) / range) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-end h-48 w-full justify-center">
                  <div
                    className="w-3/4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all"
                    style={{ height: `${height}%` }}
                    title={`${point.name}: ${formatCurrency(point.valor)}`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-400">{point.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap(d => [d.adminCapital || 0, d.userCapital || 0]));
  const minValue = Math.min(...data.flatMap(d => [d.adminCapital || 0, d.userCapital || 0]));
  const range = maxValue - minValue || 1;

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="card-fintage rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

      <div className="flex items-end gap-2 h-64 justify-between">
        {data.map((point, idx) => {
          const adminHeight = ((point.adminCapital || 0 - minValue) / range) * 100;
          const userHeight = ((point.userCapital || 0 - minValue) / range) * 100;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex gap-1 items-end h-48">
                <div
                  className="w-1/2 bg-blue-500 rounded-t-lg transition-all"
                  style={{ height: `${adminHeight}%` }}
                  title={`Admin: ${formatCurrency(point.adminCapital || 0)}`}
                />
                <div
                  className="w-1/2 bg-emerald-500 rounded-t-lg transition-all"
                  style={{ height: `${userHeight}%` }}
                  title={`User: ${formatCurrency(point.userCapital || 0)}`}
                />
              </div>
              <span className="text-xs font-medium text-gray-400">{point.name}</span>
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
