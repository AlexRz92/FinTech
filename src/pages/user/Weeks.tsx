import Layout from '../../components/layout/Layout';
import BadgePnL from '../../components/BadgePnL';
import { getWeeksData, mockUserData } from '../../lib/mockData';

export default function UserWeeks() {
  const weeks = getWeeksData();

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  const userWeeks = weeks.map((week) => ({
    weekNumber: week.weekNumber,
    startDate: week.startDate,
    endDate: week.endDate,
    capital: (week.totalCapitalAdmin + week.totalCapitalUser) / (42 + 1),
    profit: (week.pnlAdmin + week.pnlUser) / (42 + 1),
    percentage: week.percentage,
  }));

  return (
    <Layout userRole="user" userName={mockUserData.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Semanas Operadas</h1>
          <p className="text-gray-400">Historial de semanas completadas</p>
        </div>

        <div className="card-fintage rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">Semana</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-center">Fechas</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">Capital</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">Ganancia</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {userWeeks.map((week, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30">
                    <td className="px-4 py-3 text-sm font-medium text-gray-200">Semana {week.weekNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-center">
                      {week.startDate} a {week.endDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-200 text-right">{formatCurrency(week.capital)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">
                      <span className={week.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {week.profit >= 0 ? '+' : ''}{formatCurrency(week.profit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <BadgePnL value={week.percentage} showIcon={false} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
