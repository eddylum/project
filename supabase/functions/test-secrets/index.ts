import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer les variables d'environnement
    const env = {
      STRIPE_SECRET_KEY: Deno.env.get("STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET: Deno.env.get("STRIPE_WEBHOOK_SECRET"),
      SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
      SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY"),
    };

    // Tester Stripe
    let stripeTest = {
      keyExists: false,
      keyValid: false,
      error: null as string | null
    };

    if (env.STRIPE_SECRET_KEY) {
      stripeTest.keyExists = true;
      try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
          apiVersion: "2023-10-16",
        });
        await stripe.accounts.list({ limit: 1 });
        stripeTest.keyValid = true;
      } catch (e) {
        stripeTest.error = e.message;
      }
    }

    // Préparer la réponse
    const response = {
      timestamp: new Date().toISOString(),
      environment: {
        stripe: {
          secretKey: {
            exists: !!env.STRIPE_SECRET_KEY,
            prefix: env.STRIPE_SECRET_KEY?.substring(0, 7),
            valid: stripeTest.keyValid,
            error: stripeTest.error
          },
          webhookSecret: {
            exists: !!env.STRIPE_WEBHOOK_SECRET,
            prefix: env.STRIPE_WEBHOOK_SECRET?.substring(0, 6)
          }
        },
        supabase: {
          url: {
            exists: !!env.SUPABASE_URL,
            value: env.SUPABASE_URL
          },
          anonKey: {
            exists: !!env.SUPABASE_ANON_KEY,
            prefix: env.SUPABASE_ANON_KEY?.substring(0, 10)
          }
        }
      }
    };

    return new Response(
      JSON.stringify(response, null, 2),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
}); 