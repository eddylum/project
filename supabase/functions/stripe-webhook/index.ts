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
  const signature = req.headers.get("stripe-signature");
  
  try {
    console.log("Webhook appelé");
    
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    console.log("Événement reçu:", event.type);

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object;
        console.log("Mise à jour du compte:", account.id);
        console.log("Statut:", account.details_submitted ? 'active' : 'pending');
        
        await supabase
          .from('profiles')
          .update({
            stripe_account_status: account.details_submitted ? 'active' : 'pending',
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
            stripe_requirements: account.requirements,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_account_id', account.id);
          
        console.log("Profil mis à jour");
        break;
      }

      case 'account.application.deauthorized': {
        // L'hôte a déconnecté son compte
        const account = event.data.object;
        await supabase
          .from('profiles')
          .update({
            stripe_account_id: null,
            stripe_account_status: 'disconnected',
            stripe_charges_enabled: false,
            stripe_payouts_enabled: false,
            stripe_requirements: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_account_id', account.id);
        break;
      }

      case 'account.external_account.created':
      case 'account.external_account.updated':
      case 'account.external_account.deleted': {
        // Mise à jour des informations bancaires
        const account = await stripe.accounts.retrieve(event.account);
        await supabase
          .from('profiles')
          .update({
            stripe_payouts_enabled: account.payouts_enabled,
            stripe_requirements: account.requirements,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_account_id', account.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Erreur webhook:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    );
  }
}); 