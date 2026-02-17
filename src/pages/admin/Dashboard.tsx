import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import CardMetric from '../../components/CardMetric';
import DataTable from '../../components/DataTable';
import BadgePnL from '../../components/BadgePnL';
import ChartPanel from '../../components/ChartPanel';
import { mockAdminData, mockWeeks, mockChartData, mockUsers } from '../../lib/mockData';
import { DollarSign, Users, Calendar, TrendingUp, AlertCircle, Wallet } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AdminDashboard() {
  const location = useLocation();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  const renderContent = () => {
    if (location.pathname === '/admin/weeks') {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Semanas</h1>
            <p className="text-gray-600">Gestionar semanas operadas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockWeeks.map((week) => {
              const bgColor =
                week.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : week.status === 'active'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200';

              return (
                <button
                  key={week.id}
                  onClick={() => setSelectedWeek(week.id)}
                  className={`text-left p-4 rounded-lg border transition-all hover:shadow-md ${bgColor}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Semana {week.weekNumber}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {week.startDate} a {week.endDate}
                      </p>
                    </div>
                    <BadgePnL value={week.percentage} size="sm" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Capital: {formatCurrency(week.totalCapitalAdmin + week.totalCapitalUser)}
                    </p>
                    <p className="text-gray-600">
                      PnL: {formatCurrency(week.pnlAdmin + week.pnlUser)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedWeek && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Editar Semana {mockWeeks.find((w) => w.id === selectedWeek)?.weekNumber}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje
                  </label>
                  <input
                    type="number"
                    defaultValue={mockWeeks.find((w) => w.id === selectedWeek)?.percentage}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                    step="0.1"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Eliminar semana
                  </button>
                  <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (location.pathname === '/admin/capital') {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Capital</h1>
            <p className="text-gray-600">Gestionar movimientos de capital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-6 rounded-lg border border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 transition-colors text-left">
              <div className="text-lg font-semibold text-gray-900">Agregar capital admin</div>
              <p className="text-sm text-gray-600 mt-1">Depositar funds del administrador</p>
            </button>
            <button className="p-6 rounded-lg border border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 transition-colors text-left">
              <div className="text-lg font-semibold text-gray-900">Agregar capital usuario</div>
              <p className="text-sm text-gray-600 mt-1">Procesar inversión de usuario</p>
            </button>
            <button className="p-6 rounded-lg border border-gray-300 hover:border-red-400 bg-white hover:bg-red-50 transition-colors text-left">
              <div className="text-lg font-semibold text-gray-900">Registrar retiro admin</div>
              <p className="text-sm text-gray-600 mt-1">Retirar fondos del administrador</p>
            </button>
            <button className="p-6 rounded-lg border border-gray-300 hover:border-red-400 bg-white hover:bg-red-50 transition-colors text-left">
              <div className="text-lg font-semibold text-gray-900">Registrar retiro usuario</div>
              <p className="text-sm text-gray-600 mt-1">Procesar retiro de usuario</p>
            </button>
          </div>
        </div>
      );
    }

    if (location.pathname === '/admin/users') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
              <p className="text-gray-600">Gestionar inversores registrados</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Crear usuario
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Registro público deshabilitado</p>
              <p className="text-xs text-yellow-700 mt-1">
                Solo el administrador puede crear nuevas cuentas de usuario
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <DataTable
              columns={[
                { key: 'name', label: 'Nombre' },
                { key: 'email', label: 'Email' },
                { key: 'initialCapital', label: 'Capital Inicial', render: (v) => formatCurrency(v as number), align: 'right' },
                { key: 'currentCapital', label: 'Capital Actual', render: (v) => formatCurrency(v as number), align: 'right' },
                { key: 'status', label: 'Estado', render: (v) => (
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${v === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {v === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                )},
              ]}
              data={mockUsers}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Resumen general del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardMetric
            title="Capital Admin"
            value={formatCurrency(mockAdminData.capitalAdmin)}
            icon={DollarSign}
            trend={{ value: 8.5, isPositive: true }}
          />

          <CardMetric
            title="Capital Usuario"
            value={formatCurrency(mockAdminData.capitalUser)}
            icon={Wallet}
            trend={{ value: 8.5, isPositive: true }}
          />

          <CardMetric
            title="Fondo Total"
            value={formatCurrency(mockAdminData.totalFund)}
            icon={DollarSign}
            subtitle="Capital combinado"
          />

          <CardMetric
            title="HWM Actual"
            value={formatCurrency(mockAdminData.hwmCurrent)}
            icon={TrendingUp}
            subtitle="High Water Mark"
          />

          <CardMetric
            title="Retorno Acumulado"
            value={`${mockAdminData.accumulatedReturn}%`}
            icon={TrendingUp}
            subtitle="Desde inicio"
          />

          <CardMetric
            title="Usuarios Activos"
            value={mockAdminData.activeUsers}
            icon={Users}
            subtitle="Inversores registrados"
          />
        </div>

        <ChartPanel data={mockChartData} title="Evolución de Capital" />

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Semanal</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-left">Semana</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">%</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">PnL Admin</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">PnL User</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Fee</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Cap Final Admin</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Cap Final User</th>
                </tr>
              </thead>
              <tbody>
                {mockWeeks.map((week) => (
                  <tr key={week.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">Semana {week.weekNumber}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <BadgePnL value={week.percentage} showIcon={false} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(week.pnlAdmin)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(week.pnlUser)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(week.fee)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(week.capitalFinalAdmin)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(week.capitalFinalUser)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return <Layout userRole="admin" userName="Admin">{renderContent()}</Layout>;
}
