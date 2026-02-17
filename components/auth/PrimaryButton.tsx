import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PrimaryButton({ children, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      <span className="relative">{children}</span>
    </button>
  );
}
