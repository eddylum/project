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
  console.log("=== Début du traitement webhook ===");
  
  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    console.log("Body reçu:", body);

    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      STRIPE_WEBHOOK_SECRET
    );

    const account = event.data.object;
    const userId = account.metadata?.user_id;
    
    console.log("Données compte:", {
      account_id: account.id,
      user_id: userId,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      capabilities: account.capabilities
    });

    // Vérifier d'abord si l'utilisateur existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', userId)
      .single();

    console.log("Utilisateur existant:", existingUser);

    const isActive = account.details_submitted && 
                    account.charges_enabled &&
                    account.capabilities?.card_payments === 'active' &&
                    account.capabilities?.transfers === 'active';

    // Mise à jour avec vérification
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_account_id: account.id,
        stripe_account_status: isActive ? 'active' : 'pending',
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        stripe_requirements: {
          ...account.requirements,
          capabilities: account.capabilities
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    console.log("Résultat mise à jour:", {
      data: updated,
      error: updateError
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Erreur webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 200 }
    );
  }
}); 