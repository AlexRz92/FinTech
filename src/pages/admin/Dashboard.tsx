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
            Resumen Semanal Detallado
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Métricas reales de weekly_results: PnL Admin, Fee pagado al Usuario, Capital Final neto (descontado fee), y HWM actualizado
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-left">
                    Semana
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-center">
                    %
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-right">
                    PnL Admin
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-fintage-gold text-right">
                    Fee Pagado
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-blue-400 text-right">
                    Cap Final Admin
                    <div className="text-gray-500 font-normal">(neto)</div>
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-right">
                    PnL User
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-emerald-400 text-right">
                    Cap Final User
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-fintage-gold text-right">
                    HWM After
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeksWithResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
                      No hay semanas registradas
                    </td>
                  </tr>
                ) : (
                  weeksWithResults.map((week) => {
                    const adminPnl = week.result ? Number(week.result.admin_pnl) : 0;
                    const feeGenerated = week.result ? Number(week.result.fee_generated) : 0;
                    const adminCapitalEnd = week.result ? Number(week.result.admin_capital_end) : 0;
                    const userPnl = week.result ? Number(week.result.user_pnl) : 0;
                    const userCapitalEnd = week.result ? Number(week.result.user_capital_end) : 0;
                    const hwmAfter = week.result ? Number(week.result.hwm_after) : 0;

                    return (
                      <tr
                        key={week.id}
                        className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30"
                      >
                        <td className="px-3 py-3 text-sm text-gray-200">
                          Semana {week.week_number}
                        </td>
                        <td className="px-3 py-3 text-sm text-center">
                          <BadgePnL
                            value={week.percentage}
                            showIcon={false}
                            size="sm"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm text-right">
                          <span className={adminPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {week.result ? formatCurrency(adminPnl) : '-'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-fintage-gold font-medium text-right">
                          {week.result ? formatCurrency(feeGenerated) : '-'}
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-blue-400 text-right">
                          {week.result ? formatCurrency(adminCapitalEnd) : '-'}
                        </td>
                        <td className="px-3 py-3 text-sm text-right">
                          <span className={userPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {week.result ? formatCurrency(userPnl) : '-'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-emerald-400 text-right">
                          {week.result ? formatCurrency(userCapitalEnd) : '-'}
                        </td>
                        <td className="px-3 py-3 text-sm text-fintage-gold font-medium text-right">
                          {week.result ? formatCurrency(hwmAfter) : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">PnL Admin</p>
              <p className="text-sm text-gray-300">Ganancia/Pérdida del Admin</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-fintage-gold mb-1">Fee Pagado</p>
              <p className="text-sm text-gray-300">30% exceso sobre HWM</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-400 mb-1">Cap Final Admin (neto)</p>
              <p className="text-sm text-gray-300">Ya descontado fee</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-fintage-gold mb-1">HWM After</p>
              <p className="text-sm text-gray-300">Nuevo High Water Mark</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
