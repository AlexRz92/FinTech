import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-900/10 blur-3xl" />
      <div className="relative backdrop-blur-xl bg-slate-900/80 border border-[#D4AF37]/20 rounded-3xl shadow-2xl p-10">
        {children}
      </div>
    </div>
  );
}
