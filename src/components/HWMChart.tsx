import React, { useState } from 'react';

interface HWMChartDataPoint {
  name: string;
  hwm: number;
}

interface HWMChartProps {
  data: HWMChartDataPoint[];
  title: string;
}

export default function HWMChart({ data, title }: HWMChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="card-fintage rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-center">
            Aún no hay semanas operadas para mostrar evolución.
          </p>
        </div>
      </div>
    );
  }

  const hwmValues = data.map((d) => d.hwm);
  const maxValue = Math.max(...hwmValues);
  const minValue = Math.min(...hwmValues);
  const range = maxValue - minValue || 1;
  const padding = range * 0.15;

  const chartMinValue = minValue - padding;
  const chartMaxValue = maxValue + padding;
  const chartRange = chartMaxValue - chartMinValue;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const calculateY = (value: number) => {
    return 100 - ((value - chartMinValue) / chartRange) * 100;
  };

  const generateSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];

      const cp1x = curr.x + (next.x - curr.x) / 3;
      const cp1y = curr.y;
      const cp2x = next.x - (next.x - curr.x) / 3;
      const cp2y = next.y;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  const hwmChartPoints = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: calculateY(d.hwm),
  }));

  const hwmPath = generateSmoothPath(hwmChartPoints);

  const yAxisSteps = 5;
  const yAxisLabels = [];
  for (let i = 0; i <= yAxisSteps; i++) {
    const value = chartMinValue + (chartRange / yAxisSteps) * i;
    yAxisLabels.push({
      value: formatCurrency(value),
      y: 100 - (i / yAxisSteps) * 100,
    });
  }

  return (
    <div className="card-fintage rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>

      <div className="relative" style={{ height: '360px' }}>
        <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-400 pr-3 w-14">
          {yAxisLabels.reverse().map((label, idx) => (
            <div key={idx} className="text-right">
              {label.value}
            </div>
          ))}
        </div>

        <div className="absolute left-14 right-0 top-0 bottom-12 border-l border-b border-gray-600">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
            style={{ cursor: hoveredIndex !== null ? 'crosshair' : 'default' }}
          >
            <defs>
              <linearGradient id="hwmGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.25)" />
                <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[0, 20, 40, 60, 80, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="rgba(75, 85, 99, 0.2)"
                strokeWidth="0.15"
              />
            ))}

            {hwmPath && (
              <>
                <defs>
                  <clipPath id="hwmClip">
                    <path d={`${hwmPath} L 100 100 L 0 100 Z`} />
                  </clipPath>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  fill="url(#hwmGradient)"
                  clipPath="url(#hwmClip)"
                />
                <path
                  d={hwmPath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />
              </>
            )}

            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = calculateY(d.hwm);

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={hoveredIndex === i ? 1.5 : 0.9}
                  fill="#F59E0B"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    filter:
                      hoveredIndex === i
                        ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.8))'
                        : 'none',
                  }}
                />
              );
            })}
          </svg>
        </div>

        {hoveredIndex !== null && (
          <div className="absolute left-14 right-0 bottom-12 pointer-events-none">
            <div
              className="absolute h-full border-l border-gray-500 opacity-50"
              style={{
                left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
              }}
            />
          </div>
        )}

        <div className="absolute left-14 right-0 bottom-0 flex justify-between text-xs text-gray-400 px-2 h-12 items-center">
          {data.map((point, idx) => (
            <div
              key={idx}
              className="text-center flex-1"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className={hoveredIndex === idx ? 'text-white font-semibold' : ''}>
                {point.name}
              </span>
            </div>
          ))}
        </div>

        {hoveredIndex !== null && (
          <div className="absolute right-6 top-6 bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm z-10">
            <div className="font-semibold text-white mb-3">{data[hoveredIndex].name}</div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-gray-300">High Water Mark</span>
              <span className="text-amber-400 font-semibold">
                {formatCurrency(data[hoveredIndex].hwm)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-8 justify-center mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-400" />
          <span className="text-gray-300">High Water Mark (HWM)</span>
        </div>
      </div>
    </div>
  );
}
