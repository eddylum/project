import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { orderApi, supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import type { Order } from '../lib/supabase-types';

const statusConfig = {
  pending: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800',
  },
  approved: {
    label: 'Approuvé',
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-800',
  },
  rejected: {
    label: 'Refusé',
    icon: XCircle,
    className: 'bg-red-100 text-red-800',
  },
  paid: {
    label: 'Payé',
    icon: CreditCard,
    className: 'bg-emerald-100 text-emerald-800',
  },
  cancelled: {
    label: 'Annulé',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-800',
  },
};

export default function Orders() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<(Order & { property: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await orderApi.getByUser(user!.id);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Capturer ou annuler le paiement selon le statut
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('stripe_session_id')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      if (order?.stripe_session_id) {
        const { error: functionError } = await supabase.functions.invoke(
          status === 'approved' ? 'capture-payment' : 'cancel-payment',
          { 
            body: { 
              payment_intent_id: order.stripe_session_id 
            } 
          }
        );

        if (functionError) throw functionError;
      }

      // Mettre à jour le statut de la commande
      await orderApi.updateStatus(orderId, status);
      toast.success(status === 'approved' ? 'Commande approuvée et paiement capturé' : 'Commande refusée et paiement annulé');
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Commandes</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriété
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.guest_name}
                      </div>
                      <div className="text-sm text-gray-500">{order.guest_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.property.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.services.map((service: any) => service.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.total_amount.toFixed(2)} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].className}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusConfig[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'approved')}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}