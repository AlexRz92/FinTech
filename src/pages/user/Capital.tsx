import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { getCurrentUser, getUserId } from '../../lib/database';
import { supabase } from '../../lib/supabaseClient';

interface CapitalEntry {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  note: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  capital_net: number | null;
}

export default function UserCapital() {
  const [entries, setEntries] = useState<CapitalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState('Usuario');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadUserCapitalData();
  }, []);

  async function loadUserCapitalData() {
    try {
      setLoading(true);
      setError('');

      const user = await getCurrentUser();
      if (!user?.email) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      setUserName(user.email.split('@')[0]);

      const userId = await getUserId();
      if (!userId) {
        setError('No se pudo obtener el ID del usuario');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, capital_net')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        setError('Error al cargar perfil del usuario');
        setLoading(false);
        return;
      }

      setUserProfile(profile as UserProfile);
      setBalance(Number(profile.capital_net || 0));

      const { data: ledger, error: ledgerError } = await supabase
        .from('capital_ledger')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ledgerError) {
        setError('Error al cargar historial de movimientos');
        setLoading(false);
        return;
      }

      setEntries(
        (ledger || []).map((entry) => ({
          ...entry,
          amount: Number(entry.amount),
        }))
      );
    } catch (err) {
      console.error('Error loading user capital data:', err);
      setError('Error inesperado al cargar datos');
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
      hour: '2-digit',
      minute: '2-digit',
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
          <h1 className="text-2xl font-bold text-white">Mi Capital</h1>
          <p className="text-gray-400">Historial de movimientos de capital</p>
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

        {userProfile && (
          <div className="card-fintage rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Información de Cuenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Nombre</p>
                <p className="text-sm font-medium text-gray-200">
                  {userProfile.name || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-200">
                  {userProfile.email}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-400 mb-1">Capital Actual</p>
                <p className="text-xl font-semibold text-green-400">
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="card-fintage rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Historial de Movimientos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
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
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      No hay movimientos registrados
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30"
                    >
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
      </div>
    </Layout>
  );
}
