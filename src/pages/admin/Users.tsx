import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import DataTable from '../../components/DataTable';
import { AlertCircle, Loader2, Info } from 'lucide-react';
import { getProfilesWithCapital } from '../../lib/database';
import { supabase } from '../../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  capitalNet: number;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'USER' | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('Admin');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate('/login');
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email || 'Admin';
      setCurrentUserEmail(userEmail.split('@')[0]);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        console.error('Error loading profile:', profileError);
        navigate('/login');
        return;
      }

      const role = profile.role as 'ADMIN' | 'USER';
      setCurrentUserRole(role);

      if (role !== 'ADMIN') {
        navigate('/user/dashboard');
        return;
      }

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

  if (loading || !currentUserRole) {
    return (
      <Layout userRole="admin" userName={currentUserEmail}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  const isAdmin = currentUserRole === 'ADMIN';

  return (
    <Layout userRole="admin" userName={currentUserEmail}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-gray-400">Gestionar inversores registrados</p>
        </div>

        {isAdmin ? (
          <div className="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-300">Registro público deshabilitado</p>
              <p className="text-xs text-blue-400 mt-1">
                Solo el administrador puede crear nuevas cuentas de usuario
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Acceso restringido</p>
              <p className="text-xs text-red-400 mt-1">
                No tienes permisos para acceder a esta sección
              </p>
            </div>
          </div>
        )}

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
