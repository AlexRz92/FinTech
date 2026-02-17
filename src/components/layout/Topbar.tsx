import { Bell, User } from 'lucide-react';

interface TopbarProps {
  userName: string;
}

export default function Topbar({ userName }: TopbarProps) {
  return (
    <div className="h-16 bg-fintage-card border-b border-gray-800 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Bienvenido de vuelta</h2>
          <p className="text-sm text-gray-400">Aquí está tu resumen financiero</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
            <div className="w-10 h-10 gradient-fintage-blue rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400">Ver perfil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
