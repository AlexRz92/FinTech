import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Wallet, TrendingUp, PieChart, CreditCard } from 'lucide-react';

export default function AppDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Mi Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Gestiona tus finanzas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Balance Total"
          value="$45,231.89"
          subtitle="Todas las cuentas"
          icon={Wallet}
          trend="up"
          trendValue="+5.3% este mes"
        />

        <DashboardCard
          title="Inversiones"
          value="$32,450.00"
          subtitle="Portfolio activo"
          icon={TrendingUp}
          trend="up"
          trendValue="+18.2% rendimiento"
        />

        <DashboardCard
          title="Gastos del mes"
          value="$4,892.45"
          subtitle="Últimos 30 días"
          icon={CreditCard}
          trend="down"
          trendValue="-2.1% vs mes anterior"
        />

        <DashboardCard
          title="Ahorros"
          value="$12,781.89"
          subtitle="Meta: $15,000"
          icon={PieChart}
          trend="up"
          trendValue="85% completado"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Movimientos Recientes">
          <div className="space-y-3 mt-4">
            {[
              { desc: 'Salario mensual', amount: '+$5,000.00', date: 'Hoy', positive: true },
              { desc: 'Compra en Amazon', amount: '-$129.99', date: 'Ayer', positive: false },
              { desc: 'Transferencia recibida', amount: '+$500.00', date: 'Hace 2 días', positive: true },
              { desc: 'Pago de servicios', amount: '-$85.50', date: 'Hace 3 días', positive: false },
              { desc: 'Dividendos de acciones', amount: '+$247.32', date: 'Hace 4 días', positive: true },
            ].map((tx, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">{tx.desc}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
                <p className={`text-sm font-bold ${tx.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Distribución de Gastos">
          <div className="space-y-3 mt-4">
            {[
              { category: 'Vivienda', amount: '$1,500', percentage: 35 },
              { category: 'Alimentación', amount: '$800', percentage: 18 },
              { category: 'Transporte', amount: '$450', percentage: 10 },
              { category: 'Entretenimiento', amount: '$320', percentage: 7 },
              { category: 'Otros', amount: '$930', percentage: 30 },
            ].map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{cat.category}</p>
                  <p className="text-sm text-gray-400">{cat.amount}</p>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
