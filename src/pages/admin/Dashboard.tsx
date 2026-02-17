import Layout from '../../components/layout/Layout';
import CardMetric from '../../components/CardMetric';
import BadgePnL from '../../components/BadgePnL';
import ChartPanel from '../../components/ChartPanel';
import { getAdminDashboardData, getWeeksData, getChartData } from '../../lib/mockData';
import { DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';

export default function AdminDashboard() {
  const data = getAdminDashboardData();
  const weeks = getWeeksData();
  const chartData = getChartData();

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  return (
    <Layout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Administrativo</h1>
          <p className="text-gray-400">Resumen general del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardMetric
            title="Capital Admin"
            value={formatCurrency(data.capitalAdmin)}
            icon={DollarSign}
            trend={{ value: 8.5, isPositive: true }}
          />

          <CardMetric
            title="Capital Usuario"
            value={formatCurrency(data.capitalUser)}
            icon={Wallet}
            trend={{ value: 8.5, isPositive: true }}
          />

          <CardMetric
            title="Fondo Total"
            value={formatCurrency(data.totalFund)}
            icon={DollarSign}
            subtitle="Capital combinado"
          />

          <CardMetric
            title="HWM Actual"
            value={formatCurrency(data.hwmCurrent)}
            icon={TrendingUp}
            subtitle="High Water Mark"
          />

          <CardMetric
            title="Retorno Acumulado"
            value={`${data.accumulatedReturn}%`}
            icon={TrendingUp}
            subtitle="Desde inicio"
          />

          <CardMetric
            title="Usuarios Activos"
            value={data.activeUsers}
            icon={Users}
            subtitle="Inversores registrados"
          />
        </div>

        <ChartPanel data={chartData} title="Evolución de Capital" />

        <div className="card-fintage rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resumen Semanal</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">Semana</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-center">%</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">PnL Admin</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">PnL User</th>
                  <th className="px-4 py-3 text-sm font-semibold text-fintage-gold text-right">Fee</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">Cap Final Admin</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">Cap Final User</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={week.id} className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30">
                    <td className="px-4 py-3 text-sm text-gray-200">Semana {week.weekNumber}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <BadgePnL value={week.percentage} showIcon={false} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-200 text-right">{formatCurrency(week.pnlAdmin)}</td>
                    <td className="px-4 py-3 text-sm text-gray-200 text-right">{formatCurrency(week.pnlUser)}</td>
                    <td className="px-4 py-3 text-sm text-fintage-gold font-medium text-right">{formatCurrency(week.fee)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-200 text-right">{formatCurrency(week.capitalFinalAdmin)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-200 text-right">{formatCurrency(week.capitalFinalUser)}</td>
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
