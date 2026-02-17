import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Vista general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Revenue"
          value="$2,847,392"
          subtitle="Last 30 days"
          icon={DollarSign}
          trend="up"
          trendValue="+12.5% from last month"
        />

        <DashboardCard
          title="Active Users"
          value="8,429"
          subtitle="Currently online"
          icon={Users}
          trend="up"
          trendValue="+8.2% from last week"
        />

        <DashboardCard
          title="Portfolio Growth"
          value="+24.8%"
          subtitle="Year to date"
          icon={TrendingUp}
          trend="up"
          trendValue="Above market average"
        />

        <DashboardCard
          title="System Health"
          value="99.9%"
          subtitle="Uptime status"
          icon={Activity}
          trend="neutral"
          trendValue="All systems operational"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Recent Transactions">
          <div className="space-y-3 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">Transaction #{i}234</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-500">+$1,250.00</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Market Overview">
          <div className="space-y-3 mt-4">
            {[
              { name: 'BTC/USD', value: '$42,589', change: '+2.4%', up: true },
              { name: 'ETH/USD', value: '$2,247', change: '+1.8%', up: true },
              { name: 'S&P 500', value: '4,567', change: '-0.3%', up: false },
              { name: 'NASDAQ', value: '14,239', change: '+0.7%', up: true },
              { name: 'Gold', value: '$2,045', change: '+0.5%', up: true },
            ].map((market) => (
              <div
                key={market.name}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
              >
                <p className="text-sm font-medium text-white">{market.name}</p>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{market.value}</p>
                  <p className={`text-xs ${market.up ? 'text-green-500' : 'text-red-500'}`}>
                    {market.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
