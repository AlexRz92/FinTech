'use client';

import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-[#D4AF37]/30 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-blue-400" />
      ) : (
        <Sun className="w-5 h-5 text-[#D4AF37]" />
      )}
    </button>
  );
}
