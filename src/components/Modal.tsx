import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'danger';
  }[];
}

export default function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-fintage-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {actions && actions.length > 0 && (
          <div className="flex gap-3 justify-end p-6 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  action.variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'gradient-fintage-blue text-white hover-glow-blue'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
