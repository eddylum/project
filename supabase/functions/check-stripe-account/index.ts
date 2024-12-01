import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  try {
    const { accountId } = await req.json();
    
    const account = await stripe.accounts.retrieve(accountId);
    
    return new Response(
      JSON.stringify({
        account_details: {
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          capabilities: account.capabilities,
          requirements: account.requirements
        },
        should_be_active: account.details_submitted && 
                         account.charges_enabled &&
                         account.capabilities?.card_payments === 'active' &&
                         account.capabilities?.transfers === 'active'
      }, null, 2),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    );
  }
}); 