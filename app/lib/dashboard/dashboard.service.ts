import {
  getDashboardStats,
  getRecentOrders,
  getPopularProducts,
  getRevenueHistory,
} from "./dashboard.repository";

export async function getDashboard() {
  const [
    stats,
    revenue,
    recentOrders,
    popularProducts,
  ] = await Promise.all([
    getDashboardStats(),

    getRevenueHistory(30),

    getRecentOrders(10),

    getPopularProducts(10),
  ]);

  return {
    stats,
    revenue,
    recentOrders,
    popularProducts,
  };
}