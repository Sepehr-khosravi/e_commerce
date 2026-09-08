import { prisma } from "../prisma";

export async function getDashboardRawData() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const startOfCurrentMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  const startOfPreviousMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const startOfPreviousMonthEnd = startOfCurrentMonth;

  const [
    totalRevenueResult,
    todayRevenueResult,
    currentMonthRevenueResult,
    previousMonthRevenueResult,

    totalOrders,
    paidOrders,
    pendingOrders,
    cancelledOrders,
    refundedOrders,

    totalUsers,
    newUsersThisMonth,

    totalProducts,
    lowStock,
    outOfStock,

    paidOrderAmountResult,

    currentMonthPayments,
    previousMonthPayments,

    topProducts,

    orderStatusGroups,
  ] = await Promise.all([
    // =========================
    // TOTAL REVENUE
    // =========================

    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "PAID",
      },
    }),

    // =========================
    // TODAY REVENUE
    // =========================

    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "PAID",
        paidAt: {
          gte: startOfToday,
          lt: startOfTomorrow,
        },
      },
    }),

    // =========================
    // CURRENT MONTH REVENUE
    // =========================

    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "PAID",
        paidAt: {
          gte: startOfCurrentMonth,
          lt: startOfNextMonth,
        },
      },
    }),

    // =========================
    // PREVIOUS MONTH REVENUE
    // =========================

    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "PAID",
        paidAt: {
          gte: startOfPreviousMonth,
          lt: startOfPreviousMonthEnd,
        },
      },
    }),

    // =========================
    // ORDERS
    // =========================

    prisma.order.count(),

    prisma.order.count({
      where: {
        paymentStatus: "PAID",
      },
    }),

    prisma.order.count({
      where: {
        paymentStatus: "PENDING",
      },
    }),

    prisma.order.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.order.count({
      where: {
        paymentStatus: "REFUNDED",
      },
    }),

    // =========================
    // USERS
    // =========================

    prisma.user.count(),

    prisma.user.count({
      where: {
        createdAt: {
          gte: startOfCurrentMonth,
          lt: startOfNextMonth,
        },
      },
    }),

    // =========================
    // PRODUCTS
    // =========================

    prisma.product.count(),

    prisma.product.count({
      where: {
        count: {
          gt: 0,
          lte: 5,
        },
        isActive: true,
      },
    }),

    prisma.product.count({
      where: {
        count: 0,
      },
    }),

    // =========================
    // AVERAGE ORDER VALUE
    // =========================

    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        status: "PAID",
      },
    }),

   
   // =========================
   // CURRENT MONTH CHART
   // =========================
   
   prisma.payment.findMany({
     where: {
       status: "PAID",
       paidAt: {
         gte: startOfCurrentMonth,
         lt: startOfNextMonth,
       },
     },
     select: {
       amount: true,
       paidAt: true,
     },
     orderBy: {
       paidAt: "asc",
     },
   }),

  // =========================
  // PREVIOUS MONTH CHART
  // =========================
  
  prisma.payment.findMany({
    where: {
      status: "PAID",
      paidAt: {
        gte: startOfPreviousMonth,
        lt: startOfPreviousMonthEnd,
      },
    },
    select: {
      amount: true,
      paidAt: true,
    },
    orderBy: {
      paidAt: "asc",
    },
  }),

    // =========================
    // TOP PRODUCTS
    // =========================

    prisma.orderItem.findMany({
      where: {
        order: {
          paymentStatus: "PAID",
        },
      },
      select: {
        productId: true,
        productTitle: true,
        quantity: true,
        totalPrice: true,
      },
    }),

    // =========================
    // ORDER STATUS
    // =========================

    prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    }),
  ]);

  return {
    startOfCurrentMonth,
    startOfNextMonth,
    startOfPreviousMonth,
    startOfPreviousMonthEnd,

    totalRevenueResult,
    todayRevenueResult,
    currentMonthRevenueResult,
    previousMonthRevenueResult,

    totalOrders,
    paidOrders,
    pendingOrders,
    cancelledOrders,
    refundedOrders,

    totalUsers,
    newUsersThisMonth,

    totalProducts,
    lowStock,
    outOfStock,

    paidOrderAmountResult,

    currentMonthPayments,
    previousMonthPayments,

    topProducts,

    orderStatusGroups,
  };
}