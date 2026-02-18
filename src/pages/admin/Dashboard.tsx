import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import CardMetric from '../../components/CardMetric';
import BadgePnL from '../../components/BadgePnL';
import ChartPanel from '../../components/ChartPanel';
import { DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';
import {
  getWeeksWithResults,
  getFinancialState,
  getCapitalForUser,
  getAdminId,
  getUserId,
} from '../../lib/database';

interface ChartDataPoint {
  week: number;
  admin: number;
  user: number;
  total: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [capitalAdmin, setCapitalAdmin] = useState(0);
  const [capitalUser, setCapitalUser] = useState(0);
  const [totalFund, setTotalFund] = useState(0);
  const [hwmCurrent, setHwmCurrent] = useState(0);
  const [accumulatedReturn, setAccumulatedReturn] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [weeksWithResults, setWeeksWithResults] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const adminId = await getAdminId();
      const userId = await getUserId();

      if (!adminId || !userId) {
        setLoading(false);
        return;
      }

      const weeks = await getWeeksWithResults();
      setWeeksWithResults(weeks);

      const state = await getFinancialState();
      const adminCap = Number(state?.admin_capital || 0);
      const userCap = Number(state?.user_capital || 0);
      const hwm = Number(state?.hwm || 0);

      setCapitalAdmin(adminCap);
      setCapitalUser(userCap);
      setTotalFund(adminCap + userCap);
      setHwmCurrent(hwm);

      const adminCapital = await getCapitalForUser(adminId);
      const initialAdminCapital = adminCapital.net;

      if (initialAdminCapital > 0 && adminCap > 0) {
        const returnPct =
          ((adminCap - initialAdminCapital) / initialAdminCapital) * 100;
        setAccumulatedReturn(returnPct);
      } else if (adminCap > 0 && weeks.length > 0 && weeks[0]?.result) {
        const firstWeekStart = Number(weeks[0].result.admin_capital_start);
        if (firstWeekStart > 0) {
          const returnPct =
            ((adminCap - firstWeekStart) / firstWeekStart) * 100;
          setAccumulatedReturn(returnPct);
        }
      }

      const chartPoints: ChartDataPoint[] = [];
      weeks.forEach((week, idx) => {
        if (week.result) {
          chartPoints.push({
            week: week.week_number,
            admin: Number(week.result.admin_capital_end),
            user: Number(week.result.user_capital_end),
            total:
              Number(week.result.admin_capital_end) +
              Number(week.result.user_capital_end),
          });
        }
      });
      setChartData(chartPoints);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <Layout userRole="admin" userName="Admin">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-400">Resumen general del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardMetric
            title="Capital Admin"
            value={formatCurrency(capitalAdmin)}
            icon={DollarSign}
            trend={{
              value: accumulatedReturn,
              isPositive: accumulatedReturn >= 0,
            }}
          />

          <CardMetric
            title="Capital Usuario"
            value={formatCurrency(capitalUser)}
            icon={Wallet}
            trend={{ value: 0, isPositive: true }}
          />

          <CardMetric
            title="Fondo Total"
            value={formatCurrency(totalFund)}
            icon={DollarSign}
            subtitle="Capital combinado"
          />

          <CardMetric
            title="HWM Actual"
            value={formatCurrency(hwmCurrent)}
            icon={TrendingUp}
            subtitle="High Water Mark"
          />

          <CardMetric
            title="Retorno Acumulado"
            value={`${accumulatedReturn.toFixed(2)}%`}
            icon={TrendingUp}
            subtitle="Desde inicio"
          />

          <CardMetric
            title="Usuarios Activos"
            value="2"
            icon={Users}
            subtitle="Inversores registrados"
          />
        </div>

        {chartData.length > 0 && (
          <ChartPanel
            data={chartData.map((d) => ({
              name: `W${d.week}`,
              valor: d.total,
            }))}
            title="Evolución de Capital"
          />
        )}

        <div className="card-fintage rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Resumen Semanal
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">
                    Semana
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-center">
                    %
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">
                    PnL Admin
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">
                    PnL User
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-fintage-gold text-right">
                    Fee
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">
                    Cap Final Admin
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">
                    Cap Final User
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeksWithResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                      No hay semanas registradas
                    </td>
                  </tr>
                ) : (
                  weeksWithResults.map((week) => (
                    <tr
                      key={week.id}
                      className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30"
                    >
                      <td className="px-4 py-3 text-sm text-gray-200">
                        Semana {week.week_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <BadgePnL
                          value={week.percentage}
                          showIcon={false}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200 text-right">
                        {week.result
                          ? formatCurrency(Number(week.result.admin_pnl))
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200 text-right">
                        {week.result
                          ? formatCurrency(Number(week.result.user_pnl))
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-fintage-gold font-medium text-right">
                        {week.result
                          ? formatCurrency(Number(week.result.fee_generated))
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-200 text-right">
                        {week.result
                          ? formatCurrency(Number(week.result.admin_capital_end))
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-200 text-right">
                        {week.result
                          ? formatCurrency(Number(week.result.user_capital_end))
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
