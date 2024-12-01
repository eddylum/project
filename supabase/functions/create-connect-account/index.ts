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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Non autorisé");
    }

    // Récupérer le body
    const body = await req.json();
    console.log("Body reçu:", body);

    const { return_url } = body;
    if (!return_url) {
      throw new Error("URL de retour manquante");
    }

    // Vérifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Utilisateur non authentifié");
    }

    console.log("Utilisateur authentifié:", user.id);

    // Créer le compte Stripe
    console.log("Création du compte Stripe...");
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
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_account_id: account.id,
        stripe_account_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)
      .select();

    if (updateError) {
      console.error("Erreur mise à jour profil:", updateError);
      throw updateError;
    }

    console.log("Profil mis à jour avec l'ID du compte Stripe");

    // Vérifier que la mise à jour a bien été faite
    const { data: profile, error: checkError } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_account_status")
      .eq("id", user.id)
      .single();

    if (checkError) {
      console.error("Erreur vérification profil:", checkError);
    } else {
      console.log("Vérification profil:", profile);
    }

    // Créer le lien d'onboarding
    console.log("Création du lien d'onboarding avec return_url:", return_url);
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${return_url}?refresh=true`,
      return_url: `${return_url}?setup_return=true`,
      type: "account_onboarding",
    });

    console.log("Lien d'onboarding créé:", accountLink.url);

    return new Response(
      JSON.stringify({ 
        url: accountLink.url,
        accountId: account.id,
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
        error: error.message,
        success: false,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
