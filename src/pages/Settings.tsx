import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '../types/supabase';

export default function Settings() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeAccountStatus, setStripeAccountStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadStripeStatus();
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    
    if (success === 'true') {
      const syncStatus = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_account_id')
            .eq('id', user?.id)
            .single();

          if (profile?.stripe_account_id) {
            const response = await fetch('/api/sync-stripe-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                account_id: profile.stripe_account_id
              })
            });

            if (response.ok) {
              loadStripeStatus();
            }
          }
        } catch (error) {
          console.error('Error syncing status:', error);
        }
      };

      syncStatus();
      window.history.replaceState({}, '', '/settings');
    }
  }, [user]);

  const loadStripeStatus = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', user?.id)
      .single();

    if (profile) {
      setStripeAccountId(profile.stripe_account_id);
      setStripeAccountStatus(profile.stripe_account_status);
    }
  };

  const handleStripeConnect = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          return_url: `${window.location.origin}/settings`
        })
      });

      const { url, success, error } = await response.json();
      
      if (success && url) {
        window.location.href = url;
      } else {
        throw new Error(error || 'Failed to create Stripe account');
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
      alert('Failed to connect with Stripe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Paramètres</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Stripe Connect</h2>
        
        {!stripeAccountId ? (
          <button
            onClick={handleStripeConnect}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Connecter avec Stripe'}
          </button>
        ) : (
          <div>
            <p className="text-green-600 font-medium">
              Compte Stripe connecté
            </p>
            <p className="text-sm text-gray-600">
              Status: {stripeAccountStatus}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
