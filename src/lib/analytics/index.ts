import { supabase } from '../supabase';
import { AnalyticsData, DashboardStats, SetupStatus } from './types';
import { DEFAULT_ANALYTICS, DEFAULT_STATS, DEFAULT_STATUS } from './constants';

export async function getAnalytics(timeframe: 'week' | 'month' | 'year'): Promise<AnalyticsData> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session');
      return DEFAULT_ANALYTICS;
    }

    const { data, error } = await supabase.functions.invoke('get-analytics', {
      body: { 
        timeframe,
        userId: session.user.id 
      }
    });

    if (error) {
      console.error('Analytics function error:', error);
      return DEFAULT_ANALYTICS;
    }

    return data || DEFAULT_ANALYTICS;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return DEFAULT_ANALYTICS;
  }
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  if (!userId) {
    console.error('No user ID provided');
    return DEFAULT_STATS;
  }

  try {
    const propertiesPromise = supabase
      .from('properties')
      .select('id')
      .eq('user_id', userId);

    const analyticsPromise = getAnalytics('month');

    const [propertiesResult, analytics] = await Promise.all([
      propertiesPromise,
      analyticsPromise
    ]);

    if (propertiesResult.error) {
      console.error('Properties fetch error:', propertiesResult.error);
      return DEFAULT_STATS;
    }

    const properties = propertiesResult.data || [];

    if (properties.length === 0) {
      return {
        ...DEFAULT_STATS,
        revenue: analytics.monthlyRevenue
      };
    }

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .in('property_id', properties.map(p => p.id));

    if (servicesError) {
      console.error('Services fetch error:', servicesError);
      return {
        properties: properties.length,
        services: 0,
        revenue: analytics.monthlyRevenue
      };
    }

    return {
      properties: properties.length,
      services: services?.length || 0,
      revenue: analytics.monthlyRevenue
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return DEFAULT_STATS;
  }
}

export async function checkSetupStatus(userId: string): Promise<SetupStatus> {
  if (!userId) {
    console.error('No user ID provided');
    return DEFAULT_STATUS;
  }

  try {
    const propertiesPromise = supabase
      .from('properties')
      .select('id')
      .eq('user_id', userId);

    const profilePromise = supabase
      .from('profiles')
      .select('stripe_account_status')
      .eq('id', userId)
      .single();

    const [propertiesResult, profileResult] = await Promise.all([
      propertiesPromise,
      profilePromise
    ]);

    if (propertiesResult.error) {
      console.error('Properties check error:', propertiesResult.error);
      return DEFAULT_STATUS;
    }

    const properties = propertiesResult.data || [];
    const hasProperties = properties.length > 0;

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

    if (profileResult.error) {
      console.error('Profile check error:', profileResult.error);
      return { hasProperties, hasServices, hasStripeConnected: false };
    }

    return {
      hasProperties,
      hasServices,
      hasStripeConnected: profileResult.data?.stripe_account_status === 'active'
    };
  } catch (error) {
    console.error('Error checking setup status:', error);
    return DEFAULT_STATUS;
  }
}

export * from './types';