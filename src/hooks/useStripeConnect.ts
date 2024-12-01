import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function useStripeConnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const connectStripeAccount = async (returnUrl: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error("Non authentifié");
      }

      const secureReturnUrl = returnUrl.includes('localhost') 
        ? returnUrl 
        : returnUrl.replace('http://', 'https://');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session invalide");
      }

      console.log("Envoi de la requête avec returnUrl:", secureReturnUrl);

      const { data, error } = await supabase.functions.invoke(
        'create-connect-account',
        {
          body: { return_url: secureReturnUrl },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );

      console.log("Réponse reçue:", { data, error });

      if (error) {
        console.error("Erreur Stripe:", error);
        throw new Error(error.message || "Erreur lors de la création du compte");
      }

      if (!data?.url) {
        console.error("Données reçues invalides:", data);
        throw new Error("URL d'onboarding non reçue");
      }

      window.location.href = data.url;
      return true;
    } catch (err) {
      console.error("Erreur complète:", err);
      const message = err instanceof Error ? err.message : 'Erreur de connexion à Stripe';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    connectStripeAccount,
    loading,
    error
  };
} 