'use client';

import { Home, BarChart3, Wallet, Settings, Users, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: BarChart3, label: 'Analytics', href: '#' },
  { icon: Wallet, label: 'Portfolios', href: '#' },
  { icon: TrendingUp, label: 'Trading', href: '#' },
  { icon: Users, label: 'Clients', href: '#' },
  { icon: FileText, label: 'Reports', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 rounded-xl border border-[#D4AF37]/20">
            <TrendingUp className="w-6 h-6 text-[#D4AF37]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">FinTech</span>
            <span className="text-xs text-[#D4AF37] tracking-wider">PREMIUM</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 text-blue-400'
                    : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
