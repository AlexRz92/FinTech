import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import BadgePnL from '../../components/BadgePnL';
import { getCurrentUser, getWeeksWithResults, getUserId } from '../../lib/database';

interface UserWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  percentage: number;
  userCapitalStart: number;
  userCapitalEnd: number;
  userPnL: number;
  feeGenerated: number;
}

export default function UserWeeks() {
  const [weeks, setWeeks] = useState<UserWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    loadWeeks();
  }, []);

  async function loadWeeks() {
    try {
      setLoading(true);

      const user = await getCurrentUser();
      if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }

      const weeksData = await getWeeksWithResults();

      const userWeeks: UserWeek[] = weeksData
        .filter((w) => w.result)
        .map((w) => ({
          weekNumber: w.week_number,
          startDate: w.start_date,
          endDate: w.end_date,
          percentage: w.percentage,
          userCapitalStart: Number(w.result.user_capital_start),
          userCapitalEnd: Number(w.result.user_capital_end),
          userPnL: Number(w.result.user_pnl),
          feeGenerated: Number(w.result.fee_generated),
        }));

      setWeeks(userWeeks);
    } catch (err) {
      console.error('Error loading weeks:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;

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

  return (
    <Layout userRole="user" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Semanas Operadas</h1>
          <p className="text-gray-400">Historial de semanas completadas</p>
        </div>

        <div className="card-fintage rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Desglose de Ganancias por Semana
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Ganancia por tu depósito + Ganancia por tu trabajo (performance fee)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-left">
                    Semana
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-center">
                    Fechas
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-right">
                    Capital Inicial
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-green-400 text-right">
                    Ganancia Depósito
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-fintage-gold text-right">
                    Ganancia Trabajo
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-emerald-400 text-right">
                    Total Semana
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-center">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-gray-400"
                    >
                      No hay semanas registradas
                    </td>
                  </tr>
                ) : (
                  weeks.map((week, idx) => {
                    const totalWeek = week.userPnL + week.feeGenerated;

                    return (
                      <tr
                        key={idx}
                        className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30"
                      >
                        <td className="px-3 py-3 text-sm font-medium text-gray-200">
                          W{week.weekNumber}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-400 text-center">
                          {formatDate(week.startDate)} a {formatDate(week.endDate)}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-200 text-right">
                          {formatCurrency(week.userCapitalStart)}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-right">
                          <span
                            className={
                              week.userPnL >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            {week.userPnL >= 0 ? '+' : ''}
                            {formatCurrency(week.userPnL)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-fintage-gold text-right">
                          {week.feeGenerated >= 0 ? '+' : ''}
                          {formatCurrency(week.feeGenerated)}
                        </td>
                        <td className="px-3 py-3 text-sm font-bold text-emerald-400 text-right">
                          {totalWeek >= 0 ? '+' : ''}
                          {formatCurrency(totalWeek)}
                        </td>
                        <td className="px-3 py-3 text-sm text-center">
                          <BadgePnL
                            value={week.percentage}
                            showIcon={false}
                            size="sm"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-xs text-green-400 mb-1">Ganancia Depósito</p>
              <p className="text-sm text-gray-300">Rendimiento de tu capital invertido</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-fintage-gold mb-1">Ganancia Trabajo</p>
              <p className="text-sm text-gray-300">Performance fee (30% exceso sobre HWM)</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-emerald-400 mb-1">Total Semana</p>
              <p className="text-sm text-gray-300">Suma de ambas ganancias</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
