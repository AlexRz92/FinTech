import Layout from '../../components/layout/Layout';
import CardMetric from '../../components/CardMetric';
import BadgePnL from '../../components/BadgePnL';
import ChartPanel from '../../components/ChartPanel';
import { getUserDashboardData, getWeeksData, getChartData } from '../../lib/mockData';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function UserDashboard() {
  const userData = getUserDashboardData();
  const weeks = getWeeksData();
  const chartData = getChartData();
  const profitPercentage = ((userData.totalProfit / userData.initialCapital) * 100).toFixed(1);

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  return (
    <Layout userRole="user" userName={userData.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Dashboard</h1>
          <p className="text-gray-400">Resumen de tu inversión</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardMetric
            title="Capital Actual"
            value={formatCurrency(userData.currentCapital)}
            icon={DollarSign}
            trend={{ value: userData.weeklyReturn, isPositive: true }}
          />

          <CardMetric
            title="Ganancia Acumulada"
            value={formatCurrency(userData.totalProfit)}
            icon={TrendingUp}
            subtitle={`+${profitPercentage}% ROI`}
          />

          <CardMetric
            title="% Última Semana"
            value={`${userData.weeklyReturn}%`}
            icon={Calendar}
            subtitle="Retorno reciente"
          />
        </div>

        <ChartPanel data={chartData} title="Crecimiento de Capital" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-fintage rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Información</h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-800">
                <p className="text-sm text-gray-400 mb-1">Capital Inicial</p>
                <p className="text-sm font-medium text-gray-200">{formatCurrency(userData.initialCapital)}</p>
              </div>
              <div className="pb-4 border-b border-gray-800">
                <p className="text-sm text-gray-400 mb-1">Última Actualización</p>
                <p className="text-sm font-medium text-gray-200">{userData.lastUpdate}</p>
              </div>
              <div className="pb-4">
                <p className="text-sm text-gray-400 mb-1">Próxima Distribución</p>
                <p className="text-sm font-medium text-gray-200">{userData.nextDistribution}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Estado</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30">
                  Activo
                </span>
              </div>
            </div>
          </div>

          <div className="card-fintage rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Semanas Operadas</h3>
            <div className="space-y-3">
              {weeks
                .filter((w) => w.status === 'completed')
                .slice(0, 3)
                .map((week) => (
                  <div key={week.id} className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div>
                      <p className="text-sm font-medium text-gray-200">Semana {week.weekNumber}</p>
                      <p className="text-xs text-gray-400">
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
    </Layout>
  );
}
