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
        
        await updateAccountStatus(account);
        break;
      }

      case 'capability.updated': {
        const capability = event.data.object;
        const accountId = capability.account;
        console.log("Mise à jour capability pour compte:", accountId);
        
        // Récupérer le compte complet pour avoir tous les statuts
        const account = await stripe.accounts.retrieve(accountId);
        await updateAccountStatus(account);
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

async function updateAccountStatus(account: any) {
  console.log("Statut du compte:", {
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    capabilities: account.capabilities
  });

  // Un compte est considéré comme actif si :
  // 1. Les détails sont soumis
  // 2. Les paiements sont activés
  // 3. La capacité de transfert est active
  const isActive = account.details_submitted && 
                  account.charges_enabled &&
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
    .eq('stripe_account_id', account.id);

  console.log("Profil mis à jour avec statut:", isActive ? 'active' : 'pending');
} 