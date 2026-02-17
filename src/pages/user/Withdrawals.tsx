import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { getCurrentUser } from '../../lib/auth';

export default function UserWithdrawals() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    loadUserInfo();
  }, []);

  async function loadUserInfo() {
    try {
      const user = await getCurrentUser();
      if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    } catch (err) {
      console.error('Error loading user info:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;

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
          <h1 className="text-2xl font-bold text-white">Retiros</h1>
          <p className="text-gray-400">Historial de solicitudes y retiros</p>
        </div>

        <div className="card-fintage rounded-lg p-6">
          <div className="text-center py-12">
            <p className="text-gray-400">No hay retiros registrados</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
