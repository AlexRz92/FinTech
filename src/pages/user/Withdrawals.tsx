import Layout from '../../components/layout/Layout';
import { getWithdrawalsData, mockUserData } from '../../lib/mockData';

export default function UserWithdrawals() {
  const withdrawals = getWithdrawalsData();

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  const userWithdrawals = withdrawals.filter((w) => w.userId === 1);

  return (
    <Layout userRole="user" userName={mockUserData.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Retiros</h1>
          <p className="text-gray-400">Historial de solicitudes y retiros</p>
        </div>

        <div className="card-fintage rounded-lg p-6">
          {userWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay retiros registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">Monto</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">Fecha Solicitud</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {userWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30">
                      <td className="px-4 py-3 text-sm font-medium text-gray-200">
                        {formatCurrency(withdrawal.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{withdrawal.requestDate}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium border ${
                            withdrawal.status === 'pending'
                              ? 'bg-yellow-900 bg-opacity-20 text-yellow-400 border-yellow-500 border-opacity-30'
                              : 'bg-green-900 bg-opacity-20 text-green-400 border-green-500 border-opacity-30'
                          }`}
                        >
                          {withdrawal.status === 'pending' ? 'Pendiente' : 'Completado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
