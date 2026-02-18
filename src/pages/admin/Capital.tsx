import { useState, useEffect } from 'react';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/Modal';
import { getCapitalLedger, addCapitalEntry } from '../../lib/database';
import { supabase } from '../../lib/supabaseClient';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  role: 'ADMIN' | 'USER';
}

interface CapitalEntry {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  note: string | null;
  created_at: string;
}

type CapitalAction = 'admin_deposit' | 'admin_withdrawal' | 'user_deposit' | 'user_withdrawal' | null;

export default function AdminCapital() {
  const [entries, setEntries] = useState<CapitalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeAction, setActiveAction] = useState<CapitalAction>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const getUserName = (userId: string) => {
    if (adminUser?.id === userId) {
      return `${adminUser?.name || 'Admin'}`;
    }
    const user = userList.find((u) => u.id === userId);
    return user ? (user.name || user.email || user.username || 'Usuario') : 'Desconocido';
  };

  async function loadInitialData() {
    try {
      setLoading(true);
      setError('');

      await loadUsers();
      await loadEntries();
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, username, role')
        .order('role', { ascending: true });

      if (profileError) throw profileError;

      const admin = profiles?.find((p) => p.role === 'ADMIN');
      const users = profiles?.filter((p) => p.role === 'USER') || [];

      if (admin) setAdminUser(admin as User);
      setUserList(users as User[]);

      if (users.length === 1) {
        setSelectedUserId(users[0].id);
      } else if (users.length > 1) {
        setSelectedUserId(users[0].id);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      throw err;
    }
  }

  async function loadEntries() {
    try {
      const data = await getCapitalLedger();
      setEntries(
        data.map((entry) => ({
          ...entry,
          amount: Number(entry.amount),
        }))
      );
    } catch (err) {
      setError('Error al cargar historial');
      console.error(err);
    }
  }

  async function handleAddCapital() {
    if (!amount || !activeAction) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      let userId: string | null = null;
      let type: 'DEPOSIT' | 'WITHDRAWAL';

      if (activeAction === 'admin_deposit') {
        userId = adminUser?.id || null;
        type = 'DEPOSIT';
      } else if (activeAction === 'admin_withdrawal') {
        userId = adminUser?.id || null;
        type = 'WITHDRAWAL';
      } else if (activeAction === 'user_deposit') {
        userId = selectedUserId || null;
        type = 'DEPOSIT';
      } else if (activeAction === 'user_withdrawal') {
        userId = selectedUserId || null;
        type = 'WITHDRAWAL';
      }

      if (!userId) {
        setError('Usuario no disponible para esta operación');
        return;
      }

      await addCapitalEntry({
        user_id: userId,
        type,
        amount: parsedAmount,
        note: note || undefined,
      });

      setSuccess('Movimiento registrado exitosamente');
      setAmount('');
      setNote('');
      setActiveAction(null);
      await loadEntries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al registrar movimiento: ${errorMessage}`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getActionLabel = (action: CapitalAction) => {
    const labels = {
      admin_deposit: 'Agregar capital admin',
      admin_withdrawal: 'Registrar retiro admin',
      user_deposit: 'Agregar capital usuario',
      user_withdrawal: 'Registrar retiro usuario',
    };
    return labels[action as CapitalAction] || '';
  };

  const getActionDescription = (action: CapitalAction) => {
    const descriptions = {
      admin_deposit: 'Depositar funds del administrador',
      admin_withdrawal: 'Retirar fondos del administrador',
      user_deposit: 'Procesar inversión de usuario',
      user_withdrawal: 'Procesar retiro de usuario',
    };
    return descriptions[action as CapitalAction] || '';
  };

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
          <h1 className="text-2xl font-bold text-white">Capital</h1>
          <p className="text-gray-400">Gestionar movimientos de capital</p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Error</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'admin_deposit' as CapitalAction,
            'user_deposit' as CapitalAction,
            'admin_withdrawal' as CapitalAction,
            'user_withdrawal' as CapitalAction,
          ].map((action) => {
            const isUserAction = action?.includes('user');
            const isDisabled = isUserAction && userList.length === 0;

            return (
              <button
                key={action}
                onClick={() => setActiveAction(action)}
                disabled={isDisabled}
                className={`card-fintage p-6 rounded-lg transition-colors text-left ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-blue-500 hover:border-opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {getActionLabel(action)}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {isUserAction && userList.length > 0 ? (
                        <>
                          {getActionDescription(action)}
                          <br />
                          <span className="text-blue-400 mt-1 inline-block">
                            Usuario: {selectedUserId && userList.find(u => u.id === selectedUserId)?.name || userList[0]?.name}
                          </span>
                        </>
                      ) : (
                        getActionDescription(action)
                      )}
                      {isUserAction && userList.length === 0 && (
                        <span className="text-red-400 block mt-1">Sin usuarios disponibles</span>
                      )}
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="card-fintage rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Historial de Movimientos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">
                    Nota
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                      No hay movimientos registrados
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30"
                    >
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {getUserName(entry.user_id)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200 capitalize">
                        {entry.type === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-right">
                        <span
                          className={
                            entry.type === 'DEPOSIT'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {entry.type === 'DEPOSIT' ? '+' : '-'}
                          {formatCurrency(entry.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {entry.note || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          isOpen={activeAction !== null}
          onClose={() => {
            setActiveAction(null);
            setAmount('');
            setNote('');
            setError('');
          }}
          title={getActionLabel(activeAction)}
        >
          <div className="space-y-4">
            {activeAction?.includes('user') && userList.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Usuario
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input-fintage w-full px-4 py-2 rounded-lg"
                  disabled={submitting}
                >
                  {userList.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email || user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeAction?.includes('user') && userList.length === 1 && (
              <div className="p-3 bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded text-blue-400 text-sm">
                Usuario: {userList[0]?.name || userList[0]?.email}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Monto ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-fintage w-full px-4 py-2 rounded-lg"
                step="0.01"
                placeholder="0.00"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nota (opcional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-fintage w-full px-4 py-2 rounded-lg resize-none"
                rows={3}
                placeholder="Descripción del movimiento"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setActiveAction(null);
                  setAmount('');
                  setNote('');
                  setError('');
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCapital}
                disabled={submitting || !amount}
                className="flex-1 px-4 py-2 gradient-fintage-blue text-white rounded-lg hover-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Registrar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
