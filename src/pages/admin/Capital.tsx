import Layout from '../../components/layout/Layout';
import { getCapitalHistoryData } from '../../lib/mockData';

export default function AdminCapital() {
  const capitalHistory = getCapitalHistoryData();

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-ES')}`;

  return (
    <Layout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Capital</h1>
          <p className="text-gray-400">Gestionar movimientos de capital</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="card-fintage p-6 rounded-lg hover:border-blue-500 hover:border-opacity-50 transition-colors text-left">
            <div className="text-lg font-semibold text-white">Agregar capital admin</div>
            <p className="text-sm text-gray-400 mt-1">Depositar funds del administrador</p>
          </button>
          <button className="card-fintage p-6 rounded-lg hover:border-blue-500 hover:border-opacity-50 transition-colors text-left">
            <div className="text-lg font-semibold text-white">Agregar capital usuario</div>
            <p className="text-sm text-gray-400 mt-1">Procesar inversión de usuario</p>
          </button>
          <button className="card-fintage p-6 rounded-lg hover:border-red-500 hover:border-opacity-50 transition-colors text-left">
            <div className="text-lg font-semibold text-white">Registrar retiro admin</div>
            <p className="text-sm text-gray-400 mt-1">Retirar fondos del administrador</p>
          </button>
          <button className="card-fintage p-6 rounded-lg hover:border-red-500 hover:border-opacity-50 transition-colors text-left">
            <div className="text-lg font-semibold text-white">Registrar retiro usuario</div>
            <p className="text-sm text-gray-400 mt-1">Procesar retiro de usuario</p>
          </button>
        </div>

        <div className="card-fintage rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Historial de Movimientos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">Tipo</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-right">Monto</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">Fecha</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-400 text-left">Nota</th>
                </tr>
              </thead>
              <tbody>
                {capitalHistory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30">
                    <td className="px-4 py-3 text-sm text-gray-200 capitalize">
                      {item.type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right">
                      <span className={item.type.includes('deposit') ? 'text-green-400' : 'text-red-400'}>
                        {item.type.includes('deposit') ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{item.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
