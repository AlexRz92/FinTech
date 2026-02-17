import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import BadgePnL from '../../components/BadgePnL';
import { getWeeksData } from '../../lib/mockData';

export default function AdminWeeks() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const weeks = getWeeksData();

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  const selectedWeekData = weeks.find((w) => w.id === selectedWeek);

  return (
    <Layout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Semanas</h1>
          <p className="text-gray-400">Gestionar semanas operadas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeks.map((week) => {
            const bgColor =
              week.status === 'completed'
                ? 'bg-green-900 bg-opacity-20 border-green-500 border-opacity-30'
                : week.status === 'active'
                  ? 'bg-blue-900 bg-opacity-20 border-blue-500 border-opacity-30'
                  : 'bg-gray-800 border-gray-700';

            return (
              <button
                key={week.id}
                onClick={() => setSelectedWeek(week.id)}
                className={`text-left p-4 rounded-lg border transition-all hover:shadow-md ${bgColor}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white">Semana {week.weekNumber}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {week.startDate} a {week.endDate}
                    </p>
                  </div>
                  <BadgePnL value={week.percentage} size="sm" />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    Capital: {formatCurrency(week.totalCapitalAdmin + week.totalCapitalUser)}
                  </p>
                  <p className="text-gray-300">
                    PnL: {formatCurrency(week.pnlAdmin + week.pnlUser)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {selectedWeekData && (
          <div className="card-fintage rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Editar Semana {selectedWeekData.weekNumber}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Porcentaje
                </label>
                <input
                  type="number"
                  defaultValue={selectedWeekData.percentage}
                  className="input-fintage w-full px-4 py-2 rounded-lg"
                  step="0.1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Eliminar semana
                </button>
                <button className="ml-auto px-4 py-2 gradient-fintage-blue text-white rounded-lg hover-glow-blue transition-colors">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
