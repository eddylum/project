import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, MapPin, Phone, Book, Calendar } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { supabase } from '../lib/supabase';
import { createPaymentSession } from '../lib/stripe';
import toast from 'react-hot-toast';
import type { Property, Service } from '../lib/supabase-types';

export default function GuestView() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ 
    name: '', 
    email: '',
    arrivalDate: '' 
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
      loadPropertyAndServices();
    }
  }, [propertyId]);

  const loadPropertyAndServices = async () => {
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('property_id', propertyId);

      if (servicesError) throw servicesError;
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.find(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestInfo.name || !guestInfo.email || !guestInfo.arrivalDate) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setProcessingPayment(true);
      await createPaymentSession(selectedServices, propertyId!, {
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        arrivalDate: guestInfo.arrivalDate
      });
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Erreur lors du traitement de la commande');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const totalAmount = selectedServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Image d'en-tête avec overlay */}
      <div className="relative h-[70vh] md:h-[80vh] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${property?.image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        
        {/* Contenu superposé */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{property?.name}</h1>
            <div className="flex items-center text-white/90 text-lg md:text-xl">
              <MapPin className="h-6 w-6 mr-3" />
              <span>{property?.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Services disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className={`cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                selectedServices.find(s => s.id === service.id)
                  ? 'ring-2 ring-emerald-500 shadow-lg'
                  : 'hover:shadow-lg'
              }`}
            >
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
      </div>

      {/* Informations de contact */}
      {(property?.contact_phone || property?.contact_guide_url) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Informations utiles</h2>
            <div className="space-y-4">
              {property.contact_phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-6 w-6 mr-4 text-emerald-600" />
                  <span className="text-lg">En cas de besoin : {property.contact_phone}</span>
                </div>
              )}
              {property.contact_guide_url && (
                <div className="flex items-center text-gray-600">
                  <Book className="h-6 w-6 mr-4 text-emerald-600" />
                  <a 
                    href={property.contact_guide_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Guide du voyageur
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panier flottant */}
      {selectedServices.length > 0 && !showCheckout && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 md:p-6 z-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <ShoppingCart className="h-5 w-5 mr-2 text-emerald-600" />
              <span className="font-medium text-lg">{selectedServices.length} service(s) - {totalAmount.toFixed(2)} €</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full md:w-auto btn-primary px-6 py-3 rounded-lg text-lg"
            >
              Commander
            </button>
          </div>
        </div>
      )}

      {/* Modal de paiement */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Finaliser la commande</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Services sélectionnés :</h3>
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between py-2">
                  <span>{service.name}</span>
                  <span>{service.price.toFixed(2)} €</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                <span>Total</span>
                <span>{totalAmount.toFixed(2)} €</span>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="jean@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'arrivée
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    required
                    value={guestInfo.arrivalDate}
                    onChange={(e) => setGuestInfo({ ...guestInfo, arrivalDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {processingPayment ? 'Traitement...' : 'Payer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}