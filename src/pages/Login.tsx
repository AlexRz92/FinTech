import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'admin') {
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

          <h1 className="text-3xl font-bold text-center text-white mb-2">Fintage</h1>
          <p className="text-center text-gray-400 mb-8">Private Capital Management</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-fintage w-full px-4 py-3 rounded-lg"
                placeholder="Ingresa tu usuario"
                required
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Entrar como
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    role === 'user'
                      ? 'gradient-fintage-blue text-white shadow-md hover-glow-blue'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  USER
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    role === 'admin'
                      ? 'gradient-fintage-blue text-white shadow-md hover-glow-blue'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  ADMIN
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full gradient-fintage-blue text-white py-3 rounded-lg font-medium hover-glow-blue shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Entrar
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Versión 1.0.0 - Solo Frontend
          </p>
        </div>
      </div>
    </div>
  );
}
