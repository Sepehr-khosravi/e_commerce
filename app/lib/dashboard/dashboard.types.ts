export type DashboardChartPoint = {
  label: string;
  revenue: number;
};

export type DashboardProduct = {
  id: number;
  title: string;
  quantity: number;
  revenue: number;
};

export type DashboardOrderStatus = {
  status: string;
  count: number;
};

export type DashboardData = {
  // Revenue
  totalRevenue: number;
  todayRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowth: number;

  // Orders
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;

  // Sales
  averageOrderValue: number;

  // Users
  totalUsers: number;
  newUsersThisMonth: number;

  // Products / inventory
  totalProducts: number;
  lowStock: number;
  outOfStock: number;

  // Charts
  chart: DashboardChartPoint[];
  previousMonthChart: DashboardChartPoint[];

  // Extra analytics
  topProducts: DashboardProduct[];
  orderStatuses: DashboardOrderStatus[];
};