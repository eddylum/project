import React from 'react';
import { useStripeConnect } from '../../hooks/useStripeConnect';
import { CreditCard, AlertCircle, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';

interface StripeConnectProps {
  status: 'new' | 'pending' | 'active' | 'error';
  accountId?: string;
  onReset?: () => Promise<void>;
}

export default function StripeConnect({ status, accountId, onReset }: StripeConnectProps) {
  const { connectStripeAccount, loading, error } = useStripeConnect();

  const handleConnect = async () => {
    const returnUrl = `${window.location.origin}/dashboard/settings`;
    await connectStripeAccount(returnUrl);
  };

  const handleReset = async () => {
    if (onReset) {
      await onReset();
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'new':
        return (
          <div className="flex flex-col items-center p-6 bg-white rounded-lg">
            <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Connectez votre compte Stripe</h3>
            <p className="text-gray-500 text-center mb-4">
              Pour recevoir des paiements, vous devez connecter un compte Stripe
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="btn-primary px-4 py-2 rounded-lg"
            >
              {loading ? 'Connexion...' : 'Connecter Stripe'}
            </button>
            {error && (
              <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}
          </div>
        );

      case 'pending':
        return (
          <div className="flex flex-col">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400 mr-4" />
              <div>
                <h3 className="font-medium">Configuration en cours</h3>
                <p className="text-gray-500">
                  Votre compte Stripe est en cours de configuration
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleConnect}
                className="btn-primary px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
              >
                <span>Continuer la configuration</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="btn-secondary px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recommencer</span>
              </button>
            </div>
          </div>
        );

      case 'active':
        return (
          <div className="flex items-center p-6 bg-white rounded-lg shadow">
            <CheckCircle2 className="w-8 h-8 text-green-500 mr-4" />
            <div>
              <h3 className="font-medium">Compte connecté</h3>
              <p className="text-gray-500">
                Votre compte Stripe est actif et peut recevoir des paiements
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center p-6 bg-white rounded-lg shadow">
            <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
            <div>
              <h3 className="font-medium">Erreur de configuration</h3>
              <p className="text-gray-500">
                Une erreur est survenue avec votre compte Stripe
              </p>
              <button
                onClick={handleConnect}
                className="mt-2 text-sm text-blue-500 hover:underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        );
    }
  };

  return renderContent();
} 