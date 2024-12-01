// src/hooks/useStripeSetup.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createStripeConnectAccount, checkStripeStatus } from '../lib/stripe';
import toast from 'react-hot-toast';

export type StripeStatus = 'new' | 'pending' | 'active' | 'timeout';

interface UseStripeSetupProps {
  userId: string;
  profileData: any;
  onProfileUpdate: () => Promise<void>;
}

export function useStripeSetup({ userId, profileData, onProfileUpdate }: UseStripeSetupProps) {
  const [checkingStripe, setCheckingStripe] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>('new');
  const MAX_POLLING_ATTEMPTS = 24;
  const POLLING_INTERVAL = 5000;

  const handleConnectStripe = async () => {
    try {
      setCheckingStripe(true);
      setStripeStatus('pending');
      
      await supabase
        .from('profiles')
        .update({ stripe_account_status: 'pending' })
        .eq('id', userId);

      await onProfileUpdate();
      await createStripeConnectAccount();
      
      // Démarrer le polling immédiatement après la redirection
      const pollInterval = setInterval(async () => {
        const isActive = await pollStripeStatus();
        if (isActive || pollingCount >= MAX_POLLING_ATTEMPTS) {
          clearInterval(pollInterval);
          if (!isActive) setStripeStatus('timeout');
        }
        setPollingCount(prev => prev + 1);
      }, POLLING_INTERVAL);

      return true;
    } catch (error) {
      console.error('Erreur Stripe Connect:', error);
      setStripeStatus('new');
      toast.error('Erreur lors de la connexion à Stripe');
      return false;
    } finally {
      setCheckingStripe(false);
    }
  };

  const pollStripeStatus = async () => {
    if (!userId || !profileData?.stripe_account_id) return false;

    try {
      setCheckingStripe(true);
      const { data, error } = await supabase.functions.invoke('check-stripe-status', {
        body: { accountId: profileData.stripe_account_id }
      });

      if (error) throw error;

      if (data.status === 'active') {
        await supabase
          .from('profiles')
          .update({ stripe_account_status: 'active' })
          .eq('id', userId);
        
        await onProfileUpdate();
        setStripeStatus('active');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors du polling Stripe:', error);
      return false;
    } finally {
      setCheckingStripe(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const setupReturn = urlParams.get('setup_return');
    
    if (setupReturn === 'true') {
      pollStripeStatus();
    }
  }, [window.location.search]);

  useEffect(() => {
    if (profileData) {
      setStripeStatus(profileData.stripe_account_status || 'new');
      
      if (profileData.stripe_account_status === 'pending') {
        pollStripeStatus();
      }
    }
  }, [profileData]);

  return {
    stripeStatus,
    handleConnectStripe,
    checkingStripe,
  };
}
