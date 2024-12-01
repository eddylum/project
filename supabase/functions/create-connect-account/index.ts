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
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  console.log("Début de la requête");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Non autorisé");
    }

    // Récupérer les données de la requête
    const body = await req.json();
    console.log("Body reçu:", body);

    const { return_url } = body;
    if (!return_url) {
      throw new Error("URL de retour manquante");
    }

    // Vérifier HTTPS seulement si l'URL n'est pas localhost
    if (!return_url.includes('localhost') && !return_url.startsWith('https://')) {
      throw new Error("L'URL de retour doit être en HTTPS");
    }

    // Vérifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Utilisateur non authentifié");
    }

    console.log("Création du compte Stripe...");
    // Créer le compte Stripe Connect Express
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        user_id: user.id
      }
    });

    console.log("Compte Stripe créé:", account.id);

    // Mettre à jour le profil
    await supabase
      .from("profiles")
      .update({
        stripe_account_id: account.id,
        stripe_account_status: "pending"
      })
      .eq("id", user.id);

    console.log("Création du lien d'onboarding...");
    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${return_url}?refresh=true`,
      return_url: `${return_url}?setup_return=true`,
      type: "account_onboarding",
    });

    console.log("Lien d'onboarding créé:", accountLink.url);

    const response = {
      success: true,
      url: accountLink.url,
      account_id: account.id
    };

    console.log("Envoi de la réponse:", response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
