import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (property: { name: string; address: string; image_url: string }) => void;
}

export default function AddPropertyModal({ isOpen, onClose, onAdd }: AddPropertyModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [image_url, setImageUrl] = useState('https://images.unsplash.com/photo-1568605114967-8130f3a36994');
  const [showImagePreview, setShowImagePreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, address, image_url });
    onClose();
  };

  const handleImageError = () => {
    setImageUrl('https://images.unsplash.com/photo-1568605114967-8130f3a36994');
    toast.error('URL d\'image invalide');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Ajouter une propriété</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la propriété
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Villa Vue Mer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="123 Boulevard de la Plage"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image de la propriété
              </label>
              <div className="mt-1 space-y-2">
                {showImagePreview && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image_url}
                      alt="Preview"
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={image_url}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImagePreview(!showImagePreview)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 text-sm font-medium rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-sm font-medium rounded-md"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}