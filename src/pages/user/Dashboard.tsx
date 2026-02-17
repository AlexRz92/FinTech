import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import CardMetric from '../../components/CardMetric';
import BadgePnL from '../../components/BadgePnL';
import ChartPanel from '../../components/ChartPanel';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import {
  getWeeksWithResults,
  getFinancialState,
  getCapitalForUser,
  getCurrentUser,
  getUserId,
} from '../../lib/database';

interface ChartDataPoint {
  name: string;
  valor: number;
}

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [currentCapital, setCurrentCapital] = useState(0);
  const [initialCapital, setInitialCapital] = useState(0);
  const [lastWeekPercentage, setLastWeekPercentage] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    loadUserDashboardData();
  }, []);

  async function loadUserDashboardData() {
    try {
      setLoading(true);

      const user = await getCurrentUser();
      if (!user?.email) {
        setLoading(false);
        return;
      }

      setUserName(user.email.split('@')[0]);

      const userId = await getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      const capital = await getCapitalForUser(userId);
      setInitialCapital(capital.net);

      const state = await getFinancialState();
      const userCap = state?.user_capital || 0;
      setCurrentCapital(userCap);

      const weeksData = await getWeeksWithResults();
      setWeeks(weeksData);

      if (weeksData.length > 0) {
        const lastWeek = weeksData[weeksData.length - 1];
        setLastWeekPercentage(lastWeek.percentage);
      }

      const chartPoints: ChartDataPoint[] = weeksData
        .filter((w) => w.result)
        .map((w) => ({
          name: `W${w.week_number}`,
          valor: Number(w.result.user_capital_end),
        }));
      setChartData(chartPoints);
    } catch (err) {
      console.error('Error loading user dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;

  const totalProfit = currentCapital - initialCapital;
  const profitPercentage =
    initialCapital > 0
      ? ((totalProfit / initialCapital) * 100).toFixed(1)
      : '0';

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (loading) {
    return (
      <Layout userRole="user" userName={userName}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  const completedWeeks = weeks.filter((w) => w.result);

  return (
    <Layout userRole="user" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Dashboard</h1>
          <p className="text-gray-400">Resumen de tu inversión</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardMetric
            title="Capital Actual"
            value={formatCurrency(currentCapital)}
            icon={DollarSign}
            trend={{ value: lastWeekPercentage, isPositive: lastWeekPercentage >= 0 }}
          />

          <CardMetric
            title="Ganancia Acumulada"
            value={formatCurrency(totalProfit)}
            icon={TrendingUp}
            subtitle={`+${profitPercentage}% ROI`}
          />

          <CardMetric
            title="% Última Semana"
            value={`${lastWeekPercentage}%`}
            icon={Calendar}
            subtitle="Retorno reciente"
          />
        </div>

        {chartData.length > 0 && (
          <ChartPanel data={chartData} title="Crecimiento de Capital" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-fintage rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Información
            </h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-800">
                <p className="text-sm text-gray-400 mb-1">Capital Inicial</p>
                <p className="text-sm font-medium text-gray-200">
                  {formatCurrency(initialCapital)}
                </p>
              </div>
              <div className="pb-4 border-b border-gray-800">
                <p className="text-sm text-gray-400 mb-1">Última Actualización</p>
                <p className="text-sm font-medium text-gray-200">
                  {new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="pb-4">
                <p className="text-sm text-gray-400 mb-1">Semanas Operadas</p>
                <p className="text-sm font-medium text-gray-200">
                  {completedWeeks.length}
                </p>
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
            <h3 className="text-lg font-semibold text-white mb-4">
              Semanas Operadas
            </h3>
            <div className="space-y-3">
              {completedWeeks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No hay semanas registradas
                </p>
              ) : (
                completedWeeks.slice(0, 3).map((week) => (
                  <div
                    key={week.id}
                    className="flex items-center justify-between py-3 border-b border-gray-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        Semana {week.week_number}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(week.start_date)} a{' '}
                        {formatDate(week.end_date)}
                      </p>
                    </div>
                    <BadgePnL value={week.percentage} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
