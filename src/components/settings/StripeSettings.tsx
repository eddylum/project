import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";
import { useStripeSetup } from "../../hooks/useStripeSetup";
import StripeSetup from "./StripeSetup";
import toast from "react-hot-toast";

export default function StripeSettings() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("stripe_account_id, stripe_account_status")
        .eq("id", user?.id)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      toast.error("Erreur de chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const { stripeStatus, handleConnectStripe, checkingStripe } = useStripeSetup({
    userId: user?.id || "",
    profileData: profile,
    onProfileUpdate: loadProfile,
  });

  useEffect(() => {
    if (profile?.stripe_account_status === "pending") {
      const checkStatus = async () => {
        try {
          const success = await handleConnectStripe();
          if (!success) {
            toast.error("La connexion Stripe a échoué");
            await loadProfile(); // Recharger le profil en cas d'échec
          }
        } catch (error) {
          console.error("Erreur:", error);
          toast.error("Une erreur est survenue");
        }
      };
      checkStatus();
    }
  }, [profile?.stripe_account_status]);

  if (loading || checkingStripe) {
    return (
      <div className="bg-white shadow rounded p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return <StripeSetup status={stripeStatus} onConnect={handleConnectStripe} />;
}
