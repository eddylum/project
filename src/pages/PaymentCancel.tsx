import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement annulé
        </h1>
        <p className="text-gray-600 mb-6">
          Le paiement a été annulé. Vous pouvez réessayer ou revenir plus tard.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-block px-6 py-2 rounded-lg btn-primary"
          >
            Réessayer
          </button>
          <Link
            to="/"
            className="inline-block px-6 py-2 rounded-lg btn-secondary"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}