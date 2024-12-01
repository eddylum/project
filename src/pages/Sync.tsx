import React, { useState } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Sync() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const handleHospitableConnect = async () => {
    try {
      setLoading(true);
      
      // Rediriger vers l'URL d'autorisation Hospitable
      const HOSPITABLE_AUTH_URL = 'https://app.hospitable.com/oauth/authorize';
      const clientId = 'YOUR_HOSPITABLE_CLIENT_ID'; // À remplacer par votre client ID
      const redirectUri = `${window.location.origin}/dashboard/sync/callback`;
      const scope = 'properties:read';
      
      const authUrl = `${HOSPITABLE_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Hospitable:', error);
      toast.error('Erreur lors de la connexion à Hospitable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Synchronisation</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <RefreshCw className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900">Connecter Hospitable</h2>
            <p className="mt-1 text-sm text-gray-500">
              Importez automatiquement vos propriétés depuis Hospitable. Vos propriétés seront synchronisées régulièrement.
            </p>
            <button
              onClick={handleHospitableConnect}
              disabled={loading}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Connexion...' : 'Connecter Hospitable'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Propriétés synchronisées</h3>
        <p className="text-sm text-gray-500">
          Connectez-vous à Hospitable pour voir vos propriétés synchronisées ici.
        </p>
      </div>
    </div>
  );
}