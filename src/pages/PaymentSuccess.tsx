import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement réussi !
        </h1>
        <p className="text-gray-600 mb-6">
          Votre commande a été confirmée. Vous recevrez un email avec les détails.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 rounded-lg btn-primary"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}