import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BadgePnLProps {
  value: number;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export default function BadgePnL({ value, showIcon = true, size = 'md' }: BadgePnLProps) {
  const isPositive = value >= 0;
  const bgColor = isPositive ? 'bg-green-900 bg-opacity-20' : 'bg-red-900 bg-opacity-20';
  const textColor = isPositive ? 'text-green-400' : 'text-red-400';
  const borderColor = isPositive ? 'border-green-500 border-opacity-30' : 'border-red-500 border-opacity-30';
  const paddings = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg font-semibold border ${bgColor} ${textColor} ${borderColor} ${paddings}`}>
      {showIcon && (isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />)}
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
