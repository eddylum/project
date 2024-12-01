import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { useLocation } from 'react-router-dom';
import ProfileSettings from "../components/settings/ProfileSettings";
import StripeConnect from '../components/stripe/StripeConnect';
import { useStripeStatus } from '../hooks/useStripeStatus';
import toast from 'react-hot-toast';
import { Building2, CreditCard } from 'lucide-react';

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const stripeStatus = useStripeStatus(user?.id || '');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [stripeLoading, setStripeLoading] = useState(true);

  useEffect(() => {
    // Gérer le retour de Stripe
    const handleStripeReturn = async () => {
      const searchParams = new URLSearchParams(location.search);
      const setupReturn = searchParams.get('setup_return');
      const refresh = searchParams.get('refresh');

      if (setupReturn === 'true') {
        // Attendre un peu pour laisser le webhook mettre à jour le statut
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Configuration Stripe terminée !');
      } else if (refresh === 'true') {
        toast.error('La configuration Stripe a été interrompue. Veuillez réessayer.');
      }

      // Nettoyer l'URL
      window.history.replaceState({}, '', '/dashboard/settings');
    };

    if (user) {
      handleStripeReturn();
      setLoading(false);
    }
  }, [user, location]);

  useEffect(() => {
    if (stripeStatus) {
      setStripeLoading(false);
    }
  }, [stripeStatus]);

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

  const handleSyncStripe = async () => {
    try {
      setStripeLoading(true);
      const { error } = await supabase.functions.invoke('sync-stripe-status');
      if (error) throw error;
      
      // Forcer un rafraîchissement du statut
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_account_status, stripe_account_id')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      toast.success('Statut Stripe synchronisé');
    } catch (err) {
      console.error('Erreur synchronisation:', err);
      toast.error('Erreur de synchronisation');
    } finally {
      setStripeLoading(false);
    }
  };

  const handleTestSecrets = async () => {
    try {
      // Récupérer le token de session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase.functions.invoke('test-secrets', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      console.log('Test des secrets:', data);
      toast.success('Test des secrets effectué, voir la console');
    } catch (err) {
      console.error('Erreur test secrets:', err);
      toast.error('Erreur lors du test des secrets');
    }
  };

  const handleCheckStripeAccount = async () => {
    try {
      if (!stripeStatus?.accountId) {
        toast.error("Pas de compte Stripe connecté");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        'check-stripe-account',
        {
          body: { accountId: stripeStatus.accountId }
        }
      );

      if (error) throw error;
      console.log("Statut du compte Stripe:", data);
      toast.success("Vérification effectuée, voir la console");
    } catch (err) {
      console.error("Erreur vérification:", err);
      toast.error("Erreur lors de la vérification");
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
          {stripeLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
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
            </>
          )}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSyncStripe}
              className="text-sm text-gray-600 hover:text-emerald-600"
            >
              Synchroniser avec Stripe
            </button>
          </div>
          <button
            onClick={handleTestSecrets}
            className="text-sm text-gray-600 hover:text-emerald-600 ml-4"
          >
            Tester la configuration
          </button>
          <button
            onClick={handleCheckStripeAccount}
            className="text-sm text-gray-600 hover:text-emerald-600 ml-4"
          >
            Vérifier le compte
          </button>
        </div>
      </div>
    </div>
  );
}
