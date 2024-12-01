import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import AddPropertyModal from '../components/AddPropertyModal';
import { propertyApi, supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import type { Property } from '../lib/supabase-types';

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      const data = await propertyApi.getByUser(user!.id);
      setProperties(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des propriétés');
    }
  };

  const handleAddProperty = async (property: Omit<Property, 'id' | 'created_at' | 'user_id'>) => {
    try {
      await propertyApi.create(property);
      await loadProperties();
      toast.success('Propriété ajoutée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la propriété');
    }
  };

  const handleUpdateImage = async (propertyId: string, newImageUrl: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ image_url: newImageUrl })
        .eq('id', propertyId);

      if (error) throw error;
      
      await loadProperties();
      toast.success('Image mise à jour avec succès');
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Erreur lors de la mise à jour de l\'image');
    }
  };

  const handleCopyLink = (propertyId: string) => {
    const guestLink = `${window.location.origin}/guest/${propertyId}`;
    navigator.clipboard.writeText(guestLink);
    toast.success('Lien copié dans le presse-papier !');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Propriétés</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 rounded-lg btn-primary"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Ajouter une propriété
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            {...property}
            onCopyLink={() => handleCopyLink(property.id)}
            onUpdateImage={handleUpdateImage}
          />
        ))}
      </div>

      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProperty}
      />
    </div>
  );
}