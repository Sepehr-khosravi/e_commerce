export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;

  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  paidOrders: number;
  pendingPayments: number;

  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;

  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardData {
  stats: DashboardStats;
  revenue: RevenuePoint[];
  recentOrders: unknown[];
  popularProducts: unknown[];
}