import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import ProfileSettings from "../components/settings/ProfileSettings";
import StripeConnect from '../components/stripe/StripeConnect';
import { useStripeStatus } from '../hooks/useStripeStatus';
import toast from 'react-hot-toast';
import { Building2, CreditCard } from 'lucide-react';

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const stripeStatus = useStripeStatus(user?.id || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const handleHospitableConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-hospitable-auth-url', {
        body: { redirect_uri: `${window.location.origin}/dashboard/sync` }
      });

      if (error) throw error;
      if (!data?.url) throw new Error("URL d'authentification non reçue");

      window.location.href = data.url;
    } catch (error) {
      console.error('Erreur connexion Hospitable:', error);
      toast.error('Erreur lors de la connexion à Hospitable');
    }
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Paramètres</h1>

      <div className="space-y-8">
        <ProfileSettings />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Connexion Hospitable</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-gray-600">
                  Connectez-vous à Hospitable pour synchroniser vos propriétés
                </p>
              </div>
            </div>
            <button
              onClick={handleHospitableConnect}
              className="btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>Connecter Hospitable</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Paiements avec Stripe</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-gray-600">
                  {stripeStatus?.accountStatus === 'active' 
                    ? 'Votre compte Stripe est connecté et actif'
                    : 'Connectez votre compte Stripe pour recevoir des paiements'}
                </p>
                {stripeStatus?.accountStatus === 'active' && (
                  <p className="text-sm text-emerald-600 mt-1">
                    Prêt à recevoir des paiements
                  </p>
                )}
              </div>
            </div>
          </div>
          <StripeConnect 
            status={stripeStatus?.accountStatus || 'new'}
            accountId={stripeStatus?.accountId}
          />
        </div>
      </div>
    </div>
  );
}
