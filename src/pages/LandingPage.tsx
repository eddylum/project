import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Key, CreditCard, BarChart3, Percent, ShieldCheck, Clock, Smartphone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AuthModal from '../components/AuthModal';
import Logo from '../components/Logo';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Logo className="h-8 w-auto text-emerald-600" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setShowAuthModal(true);
                }}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="btn-primary px-4 py-2 rounded-lg"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Monétisez vos services</span>
            <span className="block text-emerald-600">pour locations courte durée</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Créez facilement un catalogue de services personnalisé pour vos locations. Partagez-le avec vos invités et gérez vos revenus additionnels en toute simplicité.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="w-full flex items-center justify-center px-8 py-3 rounded-md btn-primary md:py-4 md:text-lg md:px-10"
              >
                Démarrer gratuitement
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative bg-white p-6 rounded-xl shadow-sm">
            <div className="absolute -top-4 left-4 bg-emerald-50 rounded-lg p-3">
              <Key className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Gestion simplifiée</h3>
            <p className="mt-2 text-gray-500">
              Créez et gérez facilement vos services additionnels pour chaque propriété.
            </p>
          </div>

          <div className="relative bg-white p-6 rounded-xl shadow-sm">
            <div className="absolute -top-4 left-4 bg-emerald-50 rounded-lg p-3">
              <CreditCard className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Paiements sécurisés</h3>
            <p className="mt-2 text-gray-500">
              Recevez les paiements de vos clients en toute sécurité et automatiquement.
            </p>
          </div>

          <div className="relative bg-white p-6 rounded-xl shadow-sm">
            <div className="absolute -top-4 left-4 bg-emerald-50 rounded-lg p-3">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Suivi des performances</h3>
            <p className="mt-2 text-gray-500">
              Analysez vos revenus et optimisez votre offre de services.
            </p>
          </div>
        </div>

        {/* Commission Section */}
        <div className="mt-32 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-8">
                <Percent className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Seulement 5% de commission
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Nous prélevons uniquement 5% sur chaque transaction, l'un des taux les plus bas du marché. 
                Pas de frais cachés, pas d'abonnement mensuel. Vous ne payez que lorsque vous gagnez.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Features */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Tout ce dont vous avez besoin pour réussir
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="flex flex-col items-start">
              <div className="rounded-lg p-3 bg-emerald-100 mb-4">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Paiements sécurisés</h3>
              <p className="text-gray-500">
                Intégration complète avec Stripe pour des paiements sécurisés. 
                Vos clients peuvent payer en toute confiance avec leur carte bancaire.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="rounded-lg p-3 bg-emerald-100 mb-4">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Gain de temps</h3>
              <p className="text-gray-500">
                Automatisez la gestion de vos services additionnels. Plus besoin de gérer 
                manuellement les paiements ou les réservations.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="rounded-lg p-3 bg-emerald-100 mb-4">
                <Smartphone className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Interface intuitive</h3>
              <p className="text-gray-500">
                Une interface simple et moderne, accessible sur tous les appareils. 
                Vos clients peuvent réserver vos services en quelques clics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <Logo className="h-8 w-auto text-emerald-600 mb-4" />
              <p className="text-gray-500 text-sm">
                Plaazo est la solution idéale pour les propriétaires de locations courte durée 
                souhaitant monétiser leurs services additionnels de manière simple et efficace.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Légal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/terms" className="text-gray-500 hover:text-gray-900">
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-500 hover:text-gray-900">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Contact
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:contact@plaazo.com" className="text-gray-500 hover:text-gray-900">
                    contact@plaazo.com
                  </a>
                </li>
                <li className="text-gray-500">
                  © 2024 Plaazo. Tous droits réservés.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
}