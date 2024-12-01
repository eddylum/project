import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "./supabase";

const STRIPE_PUBLIC_KEY =
  "pk_live_51QLmr4C08T73wXPwHLNo1uwqNsLRLQlThGxGcpzKqzllawHIVVSZnj5WDzivRQ6eHli6O4ckgLkiallBN6X2qGLI00tj1hMxqt";
export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const checkStripeStatus = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_account_status")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile?.stripe_account_id) {
      throw new Error("No Stripe account found");
    }

    const { data, error } = await supabase.functions.invoke(
      "check-stripe-status",
      {
        body: { accountId: profile.stripe_account_id },
      }
    );

    if (error) throw error;
    return data.status === "active";
  } catch (error) {
    console.error("Error checking Stripe status:", error);
    throw error;
  }
};

export const createStripeConnectAccount = async () => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "create-connect-account",
      {
        body: {
          return_url: `${window.location.origin}/dashboard/settings`,
        },
      }
    );

    if (error) throw error;
    if (!data?.url) throw new Error("URL de connexion Stripe invalide");

    window.location.href = data.url;
    return true;
  } catch (error) {
    console.error("Stripe Connect error:", error);
    throw error;
  }
};

export const createPaymentSession = async (
  services: any[],
  propertyId: string,
  guestInfo: { guestName: string; guestEmail: string; arrivalDate: string }
) => {
  try {
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("host_stripe_account_id, user_id")
      .eq("id", propertyId)
      .single();

    if (propertyError) throw propertyError;
    if (!property?.host_stripe_account_id) {
      throw new Error("Host Stripe account not found");
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        services,
        propertyId,
        hostStripeAccountId: property.host_stripe_account_id,
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        guestInfo,
        userId: property.user_id,
      },
    });

    if (error) throw error;
    if (!data?.sessionId) throw new Error("Invalid session data");

    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe not initialized");

    const { error: redirectError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (redirectError) throw redirectError;
  } catch (error) {
    console.error("Payment error:", error);
    throw error;
  }
};
