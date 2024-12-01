import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-emerald max-w-none">
          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant la plateforme Plaazo, vous acceptez d'être lié par ces conditions générales d'utilisation.
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </p>

          <h2>2. Description du service</h2>
          <p>
            Plaazo est une plateforme permettant aux propriétaires de locations courte durée de proposer et gérer des services
            additionnels pour leurs clients. Notre service facilite la création, la gestion et le paiement de ces services.
          </p>

          <h2>3. Inscription et compte</h2>
          <p>
            Pour utiliser Plaazo, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos
            informations de connexion et de toutes les activités qui se produisent sous votre compte.
          </p>

          <h2>4. Conditions financières</h2>
          <p>
            Plaazo prélève une commission de 5% sur chaque transaction réalisée via la plateforme. Les paiements sont
            traités de manière sécurisée par Stripe.
          </p>

          <h2>5. Responsabilités</h2>
          <p>
            Les propriétaires sont responsables des services qu'ils proposent et de leur exécution. Plaazo agit uniquement
            en tant qu'intermédiaire facilitant la transaction.
          </p>

          <h2>6. Propriété intellectuelle</h2>
          <p>
            Tout le contenu présent sur Plaazo (logos, textes, fonctionnalités) est la propriété exclusive de Plaazo
            ou de ses partenaires et est protégé par les lois sur la propriété intellectuelle.
          </p>

          <h2>7. Modification des conditions</h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés
            des changements significatifs.
          </p>

          <h2>8. Résiliation</h2>
          <p>
            Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation de ces conditions
            ou pour toute autre raison à notre discrétion.
          </p>

          <h2>9. Loi applicable</h2>
          <p>
            Ces conditions sont régies par le droit français. Tout litige relatif à leur interprétation ou leur exécution
            relève des tribunaux français.
          </p>
        </div>
      </div>
    </div>
  );
}