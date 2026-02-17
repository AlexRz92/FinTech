'use client';

import { Logo } from '@/components/auth/Logo';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/auth/TextField';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <AuthCard>
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                Login
              </h1>
              <p className="text-gray-400 mt-2 text-sm">
                Accede a tu cuenta premium
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <TextField
                label="Correo"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <PrimaryButton type="submit">
                  Iniciar sesión
                </PrimaryButton>
              </div>

              <div className="text-center">
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors duration-300"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          </div>
        </AuthCard>

        <div className="text-center text-gray-500 text-xs">
          <p>Plataforma financiera institucional premium</p>
        </div>
      </div>
    </div>
  );
}
