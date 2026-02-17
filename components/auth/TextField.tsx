import { forwardRef, InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <input
          ref={ref}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-slate-600"
          {...props}
        />
      </div>
    );
  }
);

TextField.displayName = 'TextField';
