import React from 'react';
import { CheckCircle2, Circle, Building2, Package, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SetupChecklistProps {
  hasProperties: boolean;
  hasServices: boolean;
  hasStripeConnected: boolean;
}

export default function SetupChecklist({ hasProperties, hasServices, hasStripeConnected }: SetupChecklistProps) {
  const steps = [
    {
      title: 'Ajouter une propriété',
      description: 'Commencez par ajouter votre première propriété',
      completed: hasProperties,
      icon: Building2,
      link: '/dashboard/properties',
    },
    {
      title: 'Créer des services',
      description: 'Ajoutez des services à proposer à vos clients',
      completed: hasServices,
      icon: Package,
      link: '/dashboard/properties',
      disabled: !hasProperties,
    },
    {
      title: 'Connecter Stripe',
      description: 'Configurez vos paiements avec Stripe',
      completed: hasStripeConnected,
      icon: CreditCard,
      link: '/dashboard/settings',
      disabled: !hasProperties || !hasServices,
    },
  ];

  if (hasProperties && hasServices && hasStripeConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration de votre compte</h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`flex items-start space-x-4 ${
              step.disabled ? 'opacity-50' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {step.completed ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <Circle className="h-6 w-6 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {step.title}
                </h3>
                {!step.completed && !step.disabled && (
                  <Link
                    to={step.link}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Configurer →
                  </Link>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}