import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStripeStatus(userId: string) {
  const [status, setStatus] = useState<{
    accountStatus: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requirements: any;
  } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          stripe_account_status,
          stripe_charges_enabled,
          stripe_payouts_enabled,
          stripe_requirements
        `)
        .eq('id', userId)
        .single();

      if (!error && data) {
        setStatus({
          accountStatus: data.stripe_account_status,
          chargesEnabled: data.stripe_charges_enabled,
          payoutsEnabled: data.stripe_payouts_enabled,
          requirements: data.stripe_requirements
        });
      }
    };

    fetchStatus();
    
    // Souscrire aux changements
    const subscription = supabase
      .channel('stripe-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, fetchStatus)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return status;
} 