import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

serve(async (req) => {
  console.log("Webhook appelé - Début du traitement");

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Signature Stripe manquante");
      throw new Error("Signature Stripe manquante");
    }

    const body = await req.text();
    console.log("Body reçu complet:", body);

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    console.log("Événement complet:", JSON.stringify(event, null, 2));

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object;
        console.log("Compte Stripe reçu:", account);

        const userId = account.metadata?.user_id;
        if (!userId) {
          throw new Error("ID utilisateur manquant dans les métadonnées");
        }

        const isActive = account.details_submitted && 
                        account.charges_enabled &&
                        account.capabilities?.card_payments === 'active' &&
                        account.capabilities?.transfers === 'active';

        console.log("Mise à jour pour l'utilisateur:", userId, "Statut:", isActive ? 'active' : 'pending');

        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({
            stripe_account_status: isActive ? 'active' : 'pending',
            stripe_account_id: account.id,
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
            stripe_requirements: {
              ...account.requirements,
              capabilities: account.capabilities
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select();

        if (updateError) {
          console.error("Erreur mise à jour:", updateError);
          throw updateError;
        }

        console.log("Profil mis à jour:", data);
        break;
      }

      default:
        console.log("Type d'événement non géré:", event.type);
    }

    return new Response(
      JSON.stringify({ 
        received: true,
        event_type: event.type,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 200 }
    );
  }
}); 