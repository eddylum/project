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

  useEffect(() => {
    if (!userId) return;

    const fetchStatus = async () => {
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

      if (!error && data) {
        setStatus({
          accountId: data.stripe_account_id,
          accountStatus: data.stripe_account_status || 'new',
          chargesEnabled: data.stripe_charges_enabled || false,
          payoutsEnabled: data.stripe_payouts_enabled || false,
          requirements: data.stripe_requirements
        });
      }
    };

    fetchStatus();
    
    // Souscrire aux changements en temps réel
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