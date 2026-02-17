'use client';

import { Bell, Search, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Topbar() {
  return (
    <header className="h-16 bg-slate-900/30 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-[#D4AF37]/30 transition-all duration-300">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-[#D4AF37]/30 transition-all duration-300">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-white">Usuario Demo</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </button>
      </div>
    </header>
  );
}
