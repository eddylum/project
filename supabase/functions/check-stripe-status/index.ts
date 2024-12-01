import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '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'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json();

    // 1. Vérifier dans Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log("Profil Supabase:", profile);

    if (!profile?.stripe_account_id) {
      throw new Error("Pas de compte Stripe associé");
    }

    // 2. Vérifier dans Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    console.log("Compte Stripe:", account);

    return new Response(
      JSON.stringify({
        supabase_status: profile,
        stripe_status: {
          id: account.id,
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled,
          capabilities: account.capabilities
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
})