import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../supabase';
import { STRIPE_PUBLIC_KEY } from './config';

export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const checkStripeStatus = async (accountId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('No active session');
    }

    // Check URL parameters for Stripe redirect
    const urlParams = new URLSearchParams(window.location.search);
    const setupComplete = urlParams.get('setup_complete');
    
    if (setupComplete === 'true') {
      await supabase
        .from('profiles')
        .update({ stripe_account_status: 'active' })
        .eq('id', session.user.id);
      return true;
    }

    const { data, error } = await supabase.functions.invoke('check-stripe-status', {
      body: { 
        accountId,
        userId: session.user.id
      }
    });

    if (error) throw error;
    return data?.status === 'active';
  } catch (error) {
    console.error('Error checking Stripe status:', error);
    throw error;
  }
};

export const createStripeConnectAccount = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('No active session');
    }

    const { data, error } = await supabase.functions.invoke('create-connect-account', {
      body: {
        return_url: `${window.location.origin}/dashboard/settings?setup_complete=true`,
        refresh_url: `${window.location.origin}/dashboard/settings`,
        userId: session.user.id
      }
    });

    if (error || !data?.url) {
      throw error || new Error('Failed to create Stripe account');
    }

    window.location.href = data.url;
  } catch (error) {
    console.error('Stripe Connect error:', error);
    throw error;
  }
};