import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Wallet, Users, LogOut, TrendingDown } from 'lucide-react';

interface SidebarProps {
  userRole: 'admin' | 'user';
  onLogout: () => void;
}

export default function Sidebar({ userRole, onLogout }: SidebarProps) {
  const location = useLocation();

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/weeks', icon: Calendar, label: 'Semanas' },
    { to: '/admin/capital', icon: Wallet, label: 'Capital' },
    { to: '/admin/users', icon: Users, label: 'Usuarios' },
  ];

  const userLinks = [
    { to: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/user/weeks', icon: Calendar, label: 'Semanas' },
    { to: '/user/withdrawals', icon: TrendingDown, label: 'Retiros' },
  ];

  const links = userRole === 'admin' ? adminLinks : userLinks;

  return (
    <div className="w-64 bg-fintage-card border-r border-gray-800 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 gradient-fintage-blue rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FinTech</h1>
            <p className="text-xs text-gray-400 uppercase">{userRole}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 bg-opacity-20 text-blue-400 font-medium border border-blue-500 border-opacity-30'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
