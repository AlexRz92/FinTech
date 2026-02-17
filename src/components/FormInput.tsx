import React from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-lg transition-colors ${
          error ? 'border-red-400 bg-red-900 bg-opacity-20 text-red-200' : 'input-fintage'
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
