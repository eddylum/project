import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  image_url: string;
  onCopyLink: () => void;
  onUpdateImage?: (id: string, newImageUrl: string) => void;
}

export default function PropertyCard({ 
  id, 
  name, 
  address, 
  image_url, 
  onCopyLink,
  onUpdateImage 
}: PropertyCardProps) {
  const [showImageInput, setShowImageInput] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState(image_url);

  const handleImageUpdate = () => {
    if (onUpdateImage) {
      onUpdateImage(id, newImageUrl);
      setShowImageInput(false);
    }
  };

  const handleImageError = () => {
    setNewImageUrl('https://images.unsplash.com/photo-1568605114967-8130f3a36994');
    toast.error('URL d\'image invalide');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 overflow-hidden group">
        <img
          src={image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'}
          alt={name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        {onUpdateImage && (
          <button
            onClick={() => setShowImageInput(true)}
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-75 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ImageIcon className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <button
            onClick={onCopyLink}
            className="p-2 text-gray-500 hover:text-emerald-600 rounded-full hover:bg-gray-100"
            title="Copier le lien invité"
          >
            <LinkIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">{address}</p>
        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/property/${id}`}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Gérer les services →
          </Link>
        </div>
      </div>

      {showImageInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Modifier l'image</h3>
            <div className="space-y-4">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={newImageUrl}
                  alt="Preview"
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="URL de l'image"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImageInput(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleImageUpdate}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}