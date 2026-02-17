import React from 'react';

interface Week {
  id: number;
  weekNumber: number;
  status: 'completed' | 'active' | 'pending';
}

interface WeekCalendarProps {
  weeks: Week[];
  onWeekClick: (week: Week) => void;
}

export default function WeekCalendar({ weeks, onWeekClick }: WeekCalendarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {weeks.map((week) => {
        const bgColor =
          week.status === 'completed'
            ? 'bg-green-100 hover:bg-green-200 cursor-pointer'
            : week.status === 'active'
              ? 'bg-blue-100 hover:bg-blue-200 cursor-pointer'
              : 'bg-gray-100 hover:bg-gray-200 cursor-pointer';

        const textColor =
          week.status === 'completed'
            ? 'text-green-900'
            : week.status === 'active'
              ? 'text-blue-900'
              : 'text-gray-600';

        return (
          <button
            key={week.id}
            onClick={() => onWeekClick(week)}
            className={`p-4 rounded-lg text-center transition-colors ${bgColor}`}
          >
            <div className={`text-sm font-semibold ${textColor}`}>Semana {week.weekNumber}</div>
            <div className={`text-xs mt-1 ${textColor}`}>
              {week.status === 'completed' && 'Completada'}
              {week.status === 'active' && 'Activa'}
              {week.status === 'pending' && 'Pendiente'}
            </div>
          </button>
        );
      })}
    </div>
  );
}
