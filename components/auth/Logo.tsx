import { TrendingUp } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 blur-lg opacity-50 rounded-full" />
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-2xl border border-[#D4AF37]/20">
          <TrendingUp className="w-8 h-8 text-[#D4AF37]" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          FinTech
        </span>
        <span className="text-xs text-[#D4AF37] tracking-wider font-medium">
          PREMIUM
        </span>
      </div>
    </div>
  );
}
