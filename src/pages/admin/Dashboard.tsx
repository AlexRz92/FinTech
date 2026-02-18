import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import CardMetric from '../../components/CardMetric';
import BadgePnL from '../../components/BadgePnL';
import HWMChart from '../../components/HWMChart';
import LineChart from '../../components/LineChart';
import { DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';
import {
  getWeeksWithResults,
  getCapitalForUser,
  getAdminId,
  getUserId,
} from '../../lib/database';
import { supabase } from '../../lib/supabaseClient';

interface ChartDataPoint {
  name: string;
  hwm: number;
}

interface CapitalChartDataPoint {
  name: string;
  adminCapital: number;
  userCapital: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [capitalAdmin, setCapitalAdmin] = useState(0);
  const [capitalUser, setCapitalUser] = useState(0);
  const [totalFund, setTotalFund] = useState(0);
  const [hwmCurrent, setHwmCurrent] = useState(0);
  const [accumulatedReturn, setAccumulatedReturn] = useState(0);
  const [adminWeekChange, setAdminWeekChange] = useState(0);
  const [userWeekChange, setUserWeekChange] = useState(0);
  const [hwmChartData, setHwmChartData] = useState<ChartDataPoint[]>([]);
  const [capitalChartData, setCapitalChartData] = useState<CapitalChartDataPoint[]>([]);
  const [weeksWithResults, setWeeksWithResults] = useState<any[]>([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

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

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'USER');

      setActiveUsersCount(profiles?.length || 0);

      const weeks = await getWeeksWithResults();
      setWeeksWithResults(weeks);

      const completedWeeks = weeks.filter((w) => w.result);

      if (completedWeeks.length > 0) {
        const lastWeek = completedWeeks[completedWeeks.length - 1];
        const adminCap = Number(lastWeek.result.admin_capital_end);
        const userCap = Number(lastWeek.result.user_capital_end);
        const hwm = Number(lastWeek.result.hwm_after);

        setCapitalAdmin(adminCap);
        setCapitalUser(userCap);
        setTotalFund(adminCap + userCap);
        setHwmCurrent(hwm);

        if (completedWeeks.length >= 2) {
          const prevWeek = completedWeeks[completedWeeks.length - 2];
          const prevAdminCap = Number(prevWeek.result.admin_capital_end);
          const prevUserCap = Number(prevWeek.result.user_capital_end);

          if (prevAdminCap > 0) {
            const adminChange = ((adminCap - prevAdminCap) / prevAdminCap) * 100;
            setAdminWeekChange(adminChange);
          }

          if (prevUserCap > 0) {
            const userChange = ((userCap - prevUserCap) / prevUserCap) * 100;
            setUserWeekChange(userChange);
          }
        }

        const adminCapital = await getCapitalForUser(adminId);
        const initialAdminCapital = adminCapital.net;

        if (initialAdminCapital > 0 && adminCap > 0) {
          const returnPct = ((adminCap - initialAdminCapital) / initialAdminCapital) * 100;
          setAccumulatedReturn(returnPct);
        }
      } else {
        const adminCapital = await getCapitalForUser(adminId);
        const userCapital = await getCapitalForUser(userId);

        const adminCap = adminCapital.net;
        const userCap = userCapital.net;

        setCapitalAdmin(adminCap);
        setCapitalUser(userCap);
        setTotalFund(adminCap + userCap);
        setHwmCurrent(Math.max(adminCap, userCap));
      }

      const hwmPoints: ChartDataPoint[] = completedWeeks.map((week) => ({
        name: `W${week.week_number}`,
        hwm: Number(week.result.hwm_after),
      }));
      setHwmChartData(hwmPoints);

      const capitalPoints: CapitalChartDataPoint[] = completedWeeks.map((week) => ({
        name: `W${week.week_number}`,
        adminCapital: Number(week.result.admin_capital_end),
        userCapital: Number(week.result.user_capital_end),
      }));
      setCapitalChartData(capitalPoints);
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
              value: adminWeekChange,
              isPositive: adminWeekChange >= 0,
            }}
          />

          <CardMetric
            title="Capital Usuario"
            value={formatCurrency(capitalUser)}
            icon={Wallet}
            trend={{
              value: userWeekChange,
              isPositive: userWeekChange >= 0,
            }}
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
            value={activeUsersCount}
            icon={Users}
            subtitle="Inversores registrados"
          />
        </div>

        <LineChart data={capitalChartData} title="Evolución del Capital" />

        <HWMChart data={hwmChartData} title="Evolución del High Water Mark (HWM)" />

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
