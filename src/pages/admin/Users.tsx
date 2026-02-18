import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { AlertCircle, Loader2, Info, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  capitalNet: number;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'USER' | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('Admin');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');

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

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, capital_net')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        setError('No se pudo cargar usuarios. Revisar permisos/RLS.');
        setUsers([]);
        return;
      }

      const userList = (profiles || []).map((p) => ({
        id: p.id,
        email: p.email,
        role: p.role,
        created_at: p.created_at,
        capitalNet: Number(p.capital_net || 0),
      }));
      setUsers(userList);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error inesperado al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    if (!newUserEmail || !newUserPassword) return;

    try {
      setSubmitting(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Sesión expirada. Por favor, recarga la página.');
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      console.log('[handleCreateUser] Token:', session.access_token ? 'presente' : 'FALTANTE');
      console.log('[handleCreateUser] Enviando payload:', {
        name: newUserEmail.split('@')[0],
        username: newUserEmail.split('@')[0],
        email: newUserEmail,
        password: '***',
      });

      const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUserEmail.split('@')[0],
          username: newUserEmail.split('@')[0],
          email: newUserEmail,
          password: newUserPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = `[HTTP ${response.status}] `;

        if (result.step) {
          errorMessage += `[${result.step}] `;
        }

        if (result.message) {
          errorMessage += result.message;
        } else if (result.error) {
          errorMessage += result.error;
        } else {
          errorMessage += 'Error desconocido';
        }

        if (result.details) {
          errorMessage += `\n\nDetalles: ${result.details}`;
        }

        if (result.code) {
          errorMessage += `\n\nCódigo: ${result.code}`;
        }

        if (result.hint) {
          errorMessage += `\n\nSugerencia: ${result.hint}`;
        }

        setError(errorMessage);
        return;
      }

      setSuccess('Usuario creado exitosamente');
      setNewUserEmail('');
      setNewUserPassword('');
      setShowCreateModal(false);
      await loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMessage = err instanceof Error
        ? `Error de red o excepción: ${err.message}`
        : 'Error desconocido al crear usuario';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <Layout userRole="admin" userName={currentUserEmail}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">Usuarios</h1>
            <p className="text-gray-400">Gestionar inversores registrados</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 gradient-fintage-blue text-white rounded-lg hover-glow-blue transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Usuario
            </button>
          )}
        </div>

        {success && (
          <div className="p-4 bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Error</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-300">Registro público deshabilitado</p>
              <p className="text-xs text-blue-400 mt-1">
                Solo el administrador puede crear nuevas cuentas de usuario
              </p>
            </div>
          </div>
        )}

        <div className="card-fintage rounded-lg p-6">
          {error && users.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 font-medium">No se pudo cargar usuarios</p>
              <p className="text-gray-400 text-sm mt-2">Revisar permisos o configuración RLS</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No hay usuarios registrados</p>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'email', label: 'Email' },
                {
                  key: 'role',
                  label: 'Rol',
                  render: (v) => (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      v === 'ADMIN'
                        ? 'bg-purple-900 bg-opacity-20 text-purple-400 border border-purple-500 border-opacity-30'
                        : 'bg-blue-900 bg-opacity-20 text-blue-400 border border-blue-500 border-opacity-30'
                    }`}>
                      {v as string}
                    </span>
                  )
                },
                {
                  key: 'capitalNet',
                  label: 'Capital Actual',
                  render: (v) => formatCurrency(v as number),
                  align: 'right'
                },
                {
                  key: 'created_at',
                  label: 'Fecha Registro',
                  render: (v) => formatDate(v as string)
                },
              ]}
              data={users}
            />
          )}
        </div>

        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setNewUserEmail('');
            setNewUserPassword('');
            setError('');
          }}
          title="Crear Usuario"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="input-fintage w-full px-4 py-2 rounded-lg"
                placeholder="usuario@ejemplo.com"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="input-fintage w-full px-4 py-2 rounded-lg"
                placeholder="Mínimo 6 caracteres"
                disabled={submitting}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded text-red-400 text-sm">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {error}
                </pre>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUserEmail('');
                  setNewUserPassword('');
                  setError('');
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                disabled={submitting || !newUserEmail || !newUserPassword}
                className="flex-1 px-4 py-2 gradient-fintage-blue text-white rounded-lg hover-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
