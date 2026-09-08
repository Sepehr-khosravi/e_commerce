import {
  DashboardChartPoint,
  DashboardData,
  DashboardProduct,
  DashboardOrderStatus,
} from "./dashboard.types";

import {
  getDashboardRawData,
} from "./dashboard.repository";

function decimalToNumber(
  value: unknown
): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function round(value: number, digits = 2) {
  const multiplier = Math.pow(10, digits);

  return Math.round(value * multiplier) / multiplier;
}

function calculateGrowth(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    if (current === 0) {
      return 0;
    }

    return 100;
  }

  return round(
    ((current - previous) / previous) * 100
  );
}

function buildDailyChart(
  payments: {
    amount: unknown;
    paidAt: Date | null;
  }[],
  startDate: Date,
  endDate: Date
): DashboardChartPoint[] {
  const days =
    Math.ceil(
      (endDate.getTime() -
        startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  const result: DashboardChartPoint[] =
    Array.from(
      { length: days },
      (_, index) => ({
        label: String(index + 1),
        revenue: 0,
      })
    );

  for (const payment of payments) {
    if (!payment.paidAt) {
      continue;
    }

    const day =
      payment.paidAt.getDate();

    const index = day - 1;

    if (
      index >= 0 &&
      index < result.length
    ) {
      result[index].revenue +=
        decimalToNumber(payment.amount);
    }
  }

  return result;
}

function buildTopProducts(
  items: {
    productId: number;
    productTitle: string;
    quantity: number;
    totalPrice: unknown;
  }[]
): DashboardProduct[] {
  const map = new Map<
    number,
    DashboardProduct
  >();

  for (const item of items) {
    const existing =
      map.get(item.productId);

    const revenue =
      decimalToNumber(item.totalPrice);

    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += revenue;
    } else {
      map.set(item.productId, {
        id: item.productId,
        title: item.productTitle,
        quantity: item.quantity,
        revenue,
      });
    }
  }

  return Array.from(map.values())
    .sort(
      (a, b) =>
        b.quantity - a.quantity
    )
    .slice(0, 5);
}

export async function getDashboard(): Promise<DashboardData> {
  const data =
    await getDashboardRawData();

  const totalRevenue =
    decimalToNumber(
      data.totalRevenueResult._sum.amount
    );

  const todayRevenue =
    decimalToNumber(
      data.todayRevenueResult._sum.amount
    );

  const currentMonthRevenue =
    decimalToNumber(
      data.currentMonthRevenueResult._sum.amount
    );

  const previousMonthRevenue =
    decimalToNumber(
      data.previousMonthRevenueResult._sum.amount
    );

  const paidOrders =
    data.paidOrders;

  const totalPaidAmount =
    decimalToNumber(
      data.paidOrderAmountResult._sum.amount
    );

  const averageOrderValue =
    paidOrders > 0
      ? round(
          totalPaidAmount /
            paidOrders
        )
      : 0;

  const revenueGrowth =
    calculateGrowth(
      currentMonthRevenue,
      previousMonthRevenue
    );

  const chart =
    buildDailyChart(
      data.currentMonthPayments,
      data.startOfCurrentMonth,
      data.startOfNextMonth
    );

  const previousMonthChart =
    buildDailyChart(
      data.previousMonthPayments,
      data.startOfPreviousMonth,
      data.startOfPreviousMonthEnd
    );

  const topProducts =
    buildTopProducts(
      data.topProducts
    );

  const orderStatuses: DashboardOrderStatus[] =
    data.orderStatusGroups.map(
      (item) => ({
        status: item.status,
        count: item._count.id,
      })
    );

  return {
    totalRevenue,
    todayRevenue,

    currentMonthRevenue,
    previousMonthRevenue,
    revenueGrowth,

    totalOrders: data.totalOrders,
    paidOrders: data.paidOrders,
    pendingOrders: data.pendingOrders,
    cancelledOrders: data.cancelledOrders,
    refundedOrders: data.refundedOrders,

    averageOrderValue,

    totalUsers: data.totalUsers,
    newUsersThisMonth:
      data.newUsersThisMonth,

    totalProducts:
      data.totalProducts,
    lowStock: data.lowStock,
    outOfStock: data.outOfStock,

    chart,
    previousMonthChart,

    topProducts,
    orderStatuses,
  };
}