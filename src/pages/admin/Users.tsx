import Layout from '../../components/layout/Layout';
import DataTable from '../../components/DataTable';
import { getUsersData } from '../../lib/mockData';
import { AlertCircle } from 'lucide-react';

export default function AdminUsers() {
  const users = getUsersData();

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  return (
    <Layout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Usuarios</h1>
            <p className="text-gray-400">Gestionar inversores registrados</p>
          </div>
          <button className="px-4 py-2 gradient-fintage-blue text-white rounded-lg hover-glow-blue transition-colors font-medium">
            Crear usuario
          </button>
        </div>

        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Registro público deshabilitado</p>
            <p className="text-xs text-yellow-400 mt-1">
              Solo el administrador puede crear nuevas cuentas de usuario
            </p>
          </div>
        </div>

        <div className="card-fintage rounded-lg p-6">
          <DataTable
            columns={[
              { key: 'name', label: 'Nombre' },
              { key: 'email', label: 'Email' },
              { key: 'initialCapital', label: 'Capital Inicial', render: (v) => formatCurrency(v as number), align: 'right' },
              { key: 'currentCapital', label: 'Capital Actual', render: (v) => formatCurrency(v as number), align: 'right' },
              { key: 'status', label: 'Estado', render: (v) => (
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${v === 'active' ? 'bg-green-900 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30' : 'bg-gray-800 text-gray-400'}`}>
                  {v === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              )},
            ]}
            data={users}
          />
        </div>
      </div>
    </Layout>
  );
}
