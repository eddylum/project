import React from 'react';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import type { StripeStatus } from '../../hooks/useStripeSetup';

interface StripeSetupProps {
  status: StripeStatus;
  onConnect: () => void;
}

export default function StripeSetup({ status, onConnect }: StripeSetupProps) {
  const renderContent = () => {
    switch (status) {
      case 'new':
        return (
          <div className="flex items-start space-x-4">
            <CreditCard className="h-6 w-6 text-gray-400" />
            <div>
              <p className="text-gray-600">Connectez votre compte Stripe pour recevoir des paiements.</p>
              <button
                onClick={onConnect}
                className="btn-primary mt-4"
              >
                Connecter Stripe
              </button>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="text-gray-600">Votre compte Stripe est en cours de configuration.</p>
              <button onClick={onConnect} className="btn-primary mt-4">
                Continuer
              </button>
            </div>
          </div>
        );
      case 'timeout':
        return (
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <div>
              <p className="text-gray-600">La vérification a expiré. Recommencez.</p>
              <button onClick={onConnect} className="btn-primary mt-4">
                Réessayer
              </button>
            </div>
          </div>
        );
      case 'active':
        return (
          <div className="flex items-start space-x-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-gray-600">Votre compte Stripe est connecté et actif.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-lg font-medium mb-4">Compte Stripe</h2>
      {renderContent()}
    </div>
  );
}
