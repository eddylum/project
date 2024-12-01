import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Link as LinkIcon, ExternalLink, Phone, Book } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import AddServiceModal from '../components/AddServiceModal';
import { serviceApi, supabase } from '../lib/supabase';
import type { Service, Property } from '../lib/supabase-types';
import toast from 'react-hot-toast';

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    guide_url: ''
  });

  useEffect(() => {
    if (id) {
      loadPropertyAndServices();
    }
  }, [id]);

  const loadPropertyAndServices = async () => {
    try {
      // Load property data
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);
      setNewImageUrl(propertyData.image_url);
      setContactInfo({
        phone: propertyData.contact_phone || '',
        guide_url: propertyData.contact_guide_url || ''
      });

      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('property_id', id);

      if (servicesError) throw servicesError;
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleAddService = async (service: Omit<Service, 'id' | 'created_at' | 'property_id'>) => {
    try {
      await serviceApi.create({ ...service, property_id: id! });
      await loadPropertyAndServices();
      toast.success('Service ajouté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await serviceApi.delete(serviceId);
      await loadPropertyAndServices();
      toast.success('Service supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du service');
    }
  };

  const handleUpdateImage = async () => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ image_url: newImageUrl })
        .eq('id', id);

      if (error) throw error;
      await loadPropertyAndServices();
      setShowImageInput(false);
      toast.success('Image mise à jour avec succès');
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Erreur lors de la mise à jour de l\'image');
    }
  };

  const handleUpdateContactInfo = async () => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          contact_phone: contactInfo.phone || null,
          contact_guide_url: contactInfo.guide_url || null
        })
        .eq('id', id);

      if (error) throw error;
      await loadPropertyAndServices();
      toast.success('Informations de contact mises à jour');
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('Erreur lors de la mise à jour des informations de contact');
    }
  };

  const handleCopyGuestLink = () => {
    const guestLink = `${window.location.origin}/guest/${id}`;
    navigator.clipboard.writeText(guestLink);
    toast.success('Lien copié dans le presse-papier !');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour
        </button>

        {/* Header avec image */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="relative h-64">
            <img
              src={property?.image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'}
              alt={property?.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setShowImageInput(true)}
              className="absolute bottom-4 right-4 px-4 py-2 bg-white bg-opacity-90 rounded-lg shadow-sm hover:bg-opacity-100 transition-all"
            >
              Modifier l'image
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Services de la Propriété</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleCopyGuestLink}
              className="flex items-center px-4 py-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <LinkIcon className="h-5 w-5 mr-2" />
              Copier le lien
            </button>
            <a
              href={`/guest/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Ouvrir la page
            </a>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Ajouter un service
            </button>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Informations de contact</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone (optionnel)
              </label>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien du guide voyageur (optionnel)
              </label>
              <div className="flex items-center">
                <Book className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="url"
                  value={contactInfo.guide_url}
                  onChange={(e) => setContactInfo({ ...contactInfo, guide_url: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/guide"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateContactInfo}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Enregistrer les informations
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              {...service}
              onDelete={handleDeleteService}
              isManagement={true}
            />
          ))}
        </div>

        <AddServiceModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddService}
        />

        {/* Modal de modification d'image */}
        {showImageInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Modifier l'image</h3>
              <div className="space-y-4">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={newImageUrl || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'}
                    alt="Preview"
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
                    onClick={handleUpdateImage}
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
    </div>
  );
}