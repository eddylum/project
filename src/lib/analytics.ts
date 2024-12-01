import { supabase } from './supabase';
import toast from 'react-hot-toast';

export interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
    serviceName: string;
  }>;
}

const defaultAnalytics: AnalyticsData = {
  totalRevenue: 0,
  monthlyRevenue: 0,
  totalTransactions: 0,
  recentPayments: []
};

export async function getAnalytics(timeframe: 'week' | 'month' | 'year'): Promise<AnalyticsData> {
  try {
    const { data, error } = await supabase.functions.invoke('get-analytics', {
      body: { timeframe }
    });

    if (error) {
      console.error('Analytics function error:', error);
      return defaultAnalytics;
    }

    return data || defaultAnalytics;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return defaultAnalytics;
  }
}

export async function getDashboardStats(userId: string) {
  try {
    const defaultStats = {
      properties: 0,
      services: 0,
      revenue: 0
    };

    if (!userId) {
      console.error('No user ID provided');
      return defaultStats;
    }

    // Get properties count with error handling
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', userId);

    if (propertiesError) {
      console.error('Properties fetch error:', propertiesError);
      return defaultStats;
    }

    // Get services count with error handling
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .in('property_id', properties?.map(p => p.id) || []);

    if (servicesError) {
      console.error('Services fetch error:', servicesError);
      return defaultStats;
    }

    // Get monthly revenue with fallback
    const analytics = await getAnalytics('month');

    return {
      properties: properties?.length || 0,
      services: services?.length || 0,
      revenue: analytics.monthlyRevenue
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      properties: 0,
      services: 0,
      revenue: 0
    };
  }
}

export async function checkSetupStatus(userId: string) {
  try {
    const defaultStatus = {
      hasProperties: false,
      hasServices: false,
      hasStripeConnected: false
    };

    if (!userId) {
      console.error('No user ID provided');
      return defaultStatus;
    }

    // Check properties with error handling
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', userId);

    if (propertiesError) {
      console.error('Properties check error:', propertiesError);
      return defaultStatus;
    }

    const hasProperties = (properties?.length || 0) > 0;

    // Check services with error handling
    let hasServices = false;
    if (hasProperties) {
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .in('property_id', properties.map(p => p.id))
        .limit(1);

      if (!servicesError) {
        hasServices = (services?.length || 0) > 0;
      }
    }

    // Check Stripe status with error handling
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_status')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile check error:', profileError);
      return { hasProperties, hasServices, hasStripeConnected: false };
    }

    return {
      hasProperties,
      hasServices,
      hasStripeConnected: profile?.stripe_account_status === 'active'
    };
  } catch (error) {
    console.error('Error checking setup status:', error);
    return {
      hasProperties: false,
      hasServices: false,
      hasStripeConnected: false
    };
  }
}