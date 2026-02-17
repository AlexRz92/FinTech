import { useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import CardMetric from '../../components/CardMetric';
import DataTable from '../../components/DataTable';
import BadgePnL from '../../components/BadgePnL';
import ChartPanel from '../../components/ChartPanel';
import { mockUserData, mockWeeks, mockWithdrawals, mockChartData } from '../../lib/mockData';
import { DollarSign, TrendingUp, Wallet, Calendar } from 'lucide-react';

export default function UserDashboard() {
  const location = useLocation();
  const profitPercentage = ((mockUserData.totalProfit / mockUserData.initialCapital) * 100).toFixed(1);

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  const userWeeks = mockWeeks.map((week) => ({
    weekNumber: week.weekNumber,
    startDate: week.startDate,
    endDate: week.endDate,
    capital: (week.totalCapitalAdmin + week.totalCapitalUser) / (42 + 1),
    profit: (week.pnlAdmin + week.pnlUser) / (42 + 1),
    percentage: week.percentage,
  }));

  const renderContent = () => {
    if (location.pathname === '/user/weeks') {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Semanas Operadas</h1>
            <p className="text-gray-600">Historial de semanas completadas</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-left">Semana</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">Fechas</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Capital</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Ganancia</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {userWeeks.map((week, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Semana {week.weekNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">
                        {week.startDate} a {week.endDate}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(week.capital)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-right">
                        <span className={week.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
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
      );
    }

    if (location.pathname === '/user/withdrawals') {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Retiros</h1>
            <p className="text-gray-600">Historial de solicitudes y retiros</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {mockWithdrawals.filter((w) => w.userId === 1).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay retiros pendientes</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-left">Monto</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-left">Fecha Solicitud</th>
                      <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockWithdrawals
                      .filter((w) => w.userId === 1)
                      .map((withdrawal) => (
                        <tr key={withdrawal.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(withdrawal.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{withdrawal.requestDate}</td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                withdrawal.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {withdrawal.status === 'pending' ? 'Pendiente' : 'Completado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
          <p className="text-gray-600">Resumen de tu inversión</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardMetric
            title="Capital Actual"
            value={formatCurrency(mockUserData.currentCapital)}
            icon={DollarSign}
            trend={{ value: mockUserData.weeklyReturn, isPositive: true }}
          />

          <CardMetric
            title="Ganancia Acumulada"
            value={formatCurrency(mockUserData.totalProfit)}
            icon={TrendingUp}
            subtitle={`+${profitPercentage}% ROI`}
          />

          <CardMetric
            title="% Última Semana"
            value={`${mockUserData.weeklyReturn}%`}
            icon={Calendar}
            subtitle="Retorno reciente"
          />
        </div>

        <ChartPanel data={mockChartData} title="Crecimiento de Capital" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Capital Inicial</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(mockUserData.initialCapital)}</p>
              </div>
              <div className="pb-4 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Última Actualización</p>
                <p className="text-sm font-medium text-gray-900">{mockUserData.lastUpdate}</p>
              </div>
              <div className="pb-4">
                <p className="text-sm text-gray-500 mb-1">Próxima Distribución</p>
                <p className="text-sm font-medium text-gray-900">{mockUserData.nextDistribution}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Estado</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Semanas Operadas</h3>
            <div className="space-y-3">
              {mockWeeks
                .filter((w) => w.status === 'completed')
                .slice(0, 3)
                .map((week) => (
                  <div key={week.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Semana {week.weekNumber}</p>
                      <p className="text-xs text-gray-500">
                        {week.startDate} a {week.endDate}
                      </p>
                    </div>
                    <BadgePnL value={week.percentage} size="sm" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <Layout userRole="user" userName={mockUserData.name}>{renderContent()}</Layout>;
}
