import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto text-emerald-600" />
            </Link>
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>
        
        <div className="prose prose-emerald max-w-none">
          <h2>1. Collecte des données</h2>
          <p>
            Nous collectons les informations que vous nous fournissez directement lors de votre inscription
            et de l'utilisation de nos services, notamment :
          </p>
          <ul>
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Informations sur vos propriétés</li>
            <li>Données de transaction</li>
          </ul>

          <h2>2. Utilisation des données</h2>
          <p>
            Nous utilisons vos données personnelles pour :
          </p>
          <ul>
            <li>Fournir et améliorer nos services</li>
            <li>Traiter les paiements</li>
            <li>Communiquer avec vous</li>
            <li>Assurer la sécurité de notre plateforme</li>
          </ul>

          <h2>3. Protection des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre
            tout accès non autorisé, modification, divulgation ou destruction.
          </p>

          <h2>4. Partage des données</h2>
          <p>
            Nous ne partageons vos données qu'avec :
          </p>
          <ul>
            <li>Nos prestataires de services (comme Stripe pour les paiements)</li>
            <li>Les autorités lorsque la loi l'exige</li>
          </ul>

          <h2>5. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul>
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition</li>
          </ul>

          <h2>6. Cookies</h2>
          <p>
            Nous utilisons des cookies essentiels pour le fonctionnement de notre plateforme et des cookies
            analytiques pour améliorer nos services.
          </p>

          <h2>7. Contact</h2>
          <p>
            Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits,
            contactez-nous à : privacy@plaazo.com
          </p>
        </div>
      </div>
    </div>
  );
}