/// <reference types="@supabase/supabase-js" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Variables d'environnement manquantes");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Non autorisé");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Utilisateur non authentifié");
    }

    const body = await req.json();
    console.log("Body reçu:", body);

    const { accountId, return_url, user_id } = body;
    
    if (!accountId || !return_url || user_id !== user.id) {
      throw new Error("Paramètres invalides");
    }

    console.log("Tentative de récupération du compte Stripe:", accountId);
    const account = await stripe.accounts.retrieve(accountId);
    console.log("Compte Stripe trouvé:", account.id);

    console.log("Création du lien d'onboarding...");
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${return_url}?refresh=true`,
      return_url: `${return_url}?setup_return=true`,
      type: "account_onboarding",
    });

    console.log("Lien créé avec succès:", accountLink.url);

    return new Response(
      JSON.stringify({ 
        url: accountLink.url,
        success: true 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur complète:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur est survenue",
        success: false,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}); 