import React from 'react';
import { X } from 'lucide-react';
import { serviceIcons } from '../utils/serviceIcons';

interface IconSelectorProps {
  onSelect: (icon: string) => void;
  onClose: () => void;
  currentIcon: string;
}

export default function IconSelector({ onSelect, onClose, currentIcon }: IconSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Sélectionner une icône</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {Object.entries(serviceIcons).map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`p-3 rounded-lg hover:bg-gray-100 flex items-center justify-center ${
                currentIcon === name ? 'bg-emerald-50 text-emerald-600' : ''
              }`}
            >
              <Icon className="h-6 w-6" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}