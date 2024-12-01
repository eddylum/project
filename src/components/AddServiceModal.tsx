import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import IconSelector from './IconSelector';
import { serviceIcons, serviceTemplates } from '../utils/serviceIcons';
import { loadSavedServices, saveService, type SavedService } from '../lib/services';
import toast from 'react-hot-toast';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: { name: string; description: string; price: number; icon: string }) => void;
}

export default function AddServiceModal({ isOpen, onClose, onAdd }: AddServiceModalProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'saved' | 'custom'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);
  const [customService, setCustomService] = useState({
    name: '',
    description: '',
    price: '',
    icon: 'utensils'
  });
  const [showIconSelector, setShowIconSelector] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSavedServicesData();
    }
  }, [isOpen]);

  const loadSavedServicesData = async () => {
    const services = await loadSavedServices();
    setSavedServices(services);
  };

  const handleTemplateSelect = (index: number) => {
    const template = serviceTemplates[index];
    setSelectedTemplate(index);
    setCustomService({
      name: template.name,
      description: template.description,
      price: template.price.toString(),
      icon: template.icon
    });
    setActiveTab('custom');
  };

  const handleSaveTemplate = async () => {
    if (!customService.name || !customService.description || !customService.price) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const success = await saveService({
      name: customService.name,
      description: customService.description,
      price: parseFloat(customService.price),
      icon: customService.icon
    });

    if (success) {
      await loadSavedServicesData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customService.name || !customService.description || !customService.price) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    onAdd({
      name: customService.name,
      description: customService.description,
      price: parseFloat(customService.price),
      icon: customService.icon
    });
    onClose();
  };

  const handleIconSelect = (icon: string) => {
    setCustomService({ ...customService, icon });
    setShowIconSelector(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Ajouter un Service</h2>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'templates'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Modèles
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'saved'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mes Services
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'custom'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Personnalisé
          </button>
        </div>
        
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceTemplates.map((template, index) => {
              const Icon = serviceIcons[template.icon];
              return (
                <div
                  key={index}
                  onClick={() => handleTemplateSelect(index)}
                  className="p-4 border rounded-lg cursor-pointer transition-all hover:border-emerald-200"
                >
                  <div className="flex items-center mb-2">
                    <Icon className="h-5 w-5 text-emerald-600 mr-2" />
                    <h4 className="font-medium">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <p className="text-emerald-600 font-medium">{template.price.toFixed(2)} €</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedServices.map((service) => {
              const Icon = serviceIcons[service.icon];
              return (
                <div
                  key={service.id}
                  onClick={() => {
                    setCustomService({
                      name: service.name,
                      description: service.description,
                      price: service.price.toString(),
                      icon: service.icon
                    });
                    setActiveTab('custom');
                  }}
                  className="p-4 border rounded-lg cursor-pointer transition-all hover:border-emerald-200"
                >
                  <div className="flex items-center mb-2">
                    <Icon className="h-5 w-5 text-emerald-600 mr-2" />
                    <h4 className="font-medium">{service.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <p className="text-emerald-600 font-medium">{service.price.toFixed(2)} €</p>
                </div>
              );
            })}
            {savedServices.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                Aucun service sauvegardé. Sauvegardez des services pour les réutiliser facilement.
              </div>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du Service
              </label>
              <input
                type="text"
                required
                value={customService.name}
                onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ex: Service de conciergerie"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={customService.description}
                onChange={(e) => setCustomService({ ...customService, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={3}
                placeholder="Décrivez votre service..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={customService.price}
                onChange={(e) => setCustomService({ ...customService, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="29.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowIconSelector(true)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {React.createElement(serviceIcons[customService.icon], { 
                    className: "h-5 w-5 mr-2 text-emerald-600" 
                  })}
                  <span>Changer l'icône</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="flex items-center px-4 py-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter à mes services
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </form>
        )}

        {showIconSelector && (
          <IconSelector
            onSelect={handleIconSelect}
            onClose={() => setShowIconSelector(false)}
            currentIcon={customService.icon}
          />
        )}
      </div>
    </div>
  );
}