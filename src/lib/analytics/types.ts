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

export interface DashboardStats {
  properties: number;
  services: number;
  revenue: number;
}

export interface SetupStatus {
  hasProperties: boolean;
  hasServices: boolean;
  hasStripeConnected: boolean;
}