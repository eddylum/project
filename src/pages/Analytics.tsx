import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getAnalytics, type AnalyticsData } from '../lib/analytics';
import toast from 'react-hot-toast';

export default function Analytics() {
  const user = useAuthStore((state) => state.user);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics(timeframe);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des statistiques');
      setAnalytics({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalTransactions: 0,
        recentPayments: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analyses</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded-lg ${
              timeframe === 'week'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded-lg ${
              timeframe === 'month'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-4 py-2 rounded-lg ${
              timeframe === 'year'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Année
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenu Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.totalRevenue.toFixed(2)} €
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenu Mensuel</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.monthlyRevenue.toFixed(2)} €
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.totalTransactions}
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Paiements Récents
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-600">Service</th>
                  <th className="pb-3 font-medium text-gray-600">Date</th>
                  <th className="pb-3 font-medium text-gray-600">Montant</th>
                  <th className="pb-3 font-medium text-gray-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100">
                    <td className="py-3">{payment.serviceName}</td>
                    <td className="py-3">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">{payment.amount.toFixed(2)} €</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'succeeded'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status === 'succeeded' ? 'Réussi' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}