import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import DataTable from '../../components/DataTable';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getProfilesWithCapital } from '../../lib/database';

interface User {
  id: string;
  email: string;
  capitalNet: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const profiles = await getProfilesWithCapital();
      const userList = profiles
        .filter((p) => p.role === 'USER')
        .map((p) => ({
          id: p.id,
          email: p.email,
          capitalNet: Number(p.capital_net || 0),
        }));
      setUsers(userList);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;

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
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-gray-400">Gestionar inversores registrados</p>
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
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No hay usuarios registrados</p>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'email', label: 'Email' },
                { key: 'capitalNet', label: 'Capital Actual', render: (v) => formatCurrency(v as number), align: 'right' },
              ]}
              data={users}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
