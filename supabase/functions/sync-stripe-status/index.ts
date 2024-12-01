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
  try {
    // Récupérer tous les comptes avec un stripe_account_id
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, stripe_account_id')
      .not('stripe_account_id', 'is', null);

    if (profilesError) throw profilesError;

    console.log(`Synchronisation de ${profiles.length} comptes Stripe`);

    for (const profile of profiles) {
      try {
        const account = await stripe.accounts.retrieve(profile.stripe_account_id);
        
        const isActive = account.details_submitted && 
                        account.charges_enabled &&
                        account.capabilities?.card_payments === 'active' &&
                        account.capabilities?.transfers === 'active';

        await supabase
          .from('profiles')
          .update({
            stripe_account_status: isActive ? 'active' : 'pending',
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
            stripe_requirements: {
              ...account.requirements,
              capabilities: account.capabilities
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        console.log(`Compte ${profile.stripe_account_id} mis à jour: ${isActive ? 'active' : 'pending'}`);
      } catch (err) {
        console.error(`Erreur pour le compte ${profile.stripe_account_id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: profiles.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error('Erreur:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}); 