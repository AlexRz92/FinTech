import Link from 'next/link';
import { Logo } from '@/components/auth/Logo';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />

      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <Logo />

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            Plataforma Financiera Premium
          </h1>
          <p className="text-xl text-gray-400 max-w-lg mx-auto">
            Gestiona tus inversiones con tecnología de nivel institucional
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] flex items-center gap-2"
          >
            Iniciar sesión
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/admin/dashboard"
            className="px-8 py-4 bg-slate-800/50 border border-slate-700 hover:border-[#D4AF37]/30 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Ver Demo
          </Link>
        </div>

        <div className="pt-8 grid grid-cols-3 gap-8 max-w-xl mx-auto">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">$2.8B+</p>
            <p className="text-sm text-gray-500 mt-1">Assets Under Management</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">8,429</p>
            <p className="text-sm text-gray-500 mt-1">Active Clients</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">99.9%</p>
            <p className="text-sm text-gray-500 mt-1">System Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
