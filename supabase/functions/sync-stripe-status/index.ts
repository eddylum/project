import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { account_id } = await req.json();
    
    if (!account_id) {
      throw new Error('Account ID is required');
    }

    // Récupérer le statut du compte depuis Stripe
    const account = await stripe.accounts.retrieve(account_id);
    
    // Mettre à jour le statut dans Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_account_status: account.details_submitted ? 'active' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_account_id', account_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, status: account.details_submitted ? 'active' : 'pending' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 