import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, LogIn, Loader2 } from 'lucide-react';
import { signIn } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    if (!user) {
      setError('Credenciales inválidas');
      setLoading(false);
      return;
    }

    if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-fintage rounded-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 gradient-fintage-blue rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-2">FinTech</h1>
          <p className="text-center text-gray-400 mb-8">Tecnología Financiera</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-fintage w-full px-4 py-3 rounded-lg"
                placeholder="Ingresa tu usuario"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-fintage w-full px-4 py-3 rounded-lg"
                placeholder="Ingresa tu contraseña"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-fintage-blue text-white py-3 rounded-lg font-medium hover-glow-blue shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Ingresar
                </>
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center mt-2">
                {error}
              </p>
            )}

            <p className="text-center text-xs text-gray-500 mt-4">
              Acceso privado. Autenticación requerida.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
