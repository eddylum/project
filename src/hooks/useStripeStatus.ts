import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type StripeAccountStatus = 'new' | 'pending' | 'active' | 'error';

interface StripeStatus {
  accountStatus: StripeAccountStatus;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements: any;
}

export function useStripeStatus(userId: string) {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const fetchStatus = async () => {
    console.log("Fetching stripe status for user:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        stripe_account_id,
        stripe_account_status,
        stripe_charges_enabled,
        stripe_payouts_enabled,
        stripe_requirements
      `)
      .eq('id', userId)
      .single();

    console.log("Stripe status response:", { data, error });

    if (!error && data) {
      const newStatus = {
        accountId: data.stripe_account_id,
        accountStatus: data.stripe_account_status || 'new',
        chargesEnabled: data.stripe_charges_enabled || false,
        payoutsEnabled: data.stripe_payouts_enabled || false,
        requirements: data.stripe_requirements
      };
      
      console.log("Setting new stripe status:", newStatus);
      setStatus(newStatus);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchStatus();
    
    // Rafraîchir toutes les 5 secondes pendant 1 minute après un retour de Stripe
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('setup_return') === 'true') {
      const interval = setInterval(() => {
        setLastUpdate(Date.now());
      }, 5000);

      setTimeout(() => {
        clearInterval(interval);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [userId]);

  // Rafraîchir le statut quand lastUpdate change
  useEffect(() => {
    if (userId) {
      fetchStatus();
    }
  }, [userId, lastUpdate]);

  // Souscrire aux changements en temps réel
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('stripe-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, (payload) => {
        console.log("Real-time update received:", payload);
        fetchStatus();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return status;
} 