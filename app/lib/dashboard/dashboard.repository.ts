import { prisma } from "../prisma";

export async function getDashboardStats() {
  const now = new Date();

  const startOfToday = new Date(now);

  startOfToday.setHours(
    0,
    0,
    0,
    0
  );

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const [
    totalUsers,
    totalProducts,
    totalOrders,

    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,

    paidOrders,
    pendingPayments,

    totalRevenue,
    todayRevenue,
    monthRevenue,

    lowStockProducts,
    outOfStockProducts,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.product.count({
      where: {
        isActive: true,
      },
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.order.count({
      where: {
        status: "PROCESSING",
      },
    }),

    prisma.order.count({
      where: {
        status: "SHIPPED",
      },
    }),

    prisma.order.count({
      where: {
        status: "DELIVERED",
      },
    }),

    prisma.order.count({
      where: {
        status: "CANCELLED",
      },
    }),

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

    getRevenue(),

    getRevenue({
      from: startOfToday,
    }),

    getRevenue({
      from: startOfMonth,
    }),

    prisma.product.count({
      where: {
        isActive: true,
        count: {
          gt: 0,
          lte: 5,
        },
      },
    }),

    prisma.product.count({
      where: {
        isActive: true,
        count: {
          lte: 0,
        },
      },
    }),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,

    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,

    paidOrders,
    pendingPayments,

    totalRevenue,
    todayRevenue,
    monthRevenue,

    lowStockProducts,
    outOfStockProducts,
  };
}

async function getRevenue(options?: {
  from?: Date;
  to?: Date;
}) {
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "PAID",

      ...(options?.from ||
      options?.to
        ? {
            createdAt: {
              ...(options?.from
                ? {
                    gte: options.from,
                  }
                : {}),

              ...(options?.to
                ? {
                    lte: options.to,
                  }
                : {}),
            },
          }
        : {}),
    },

    select: {
      totalPrice: true,
    },
  });

  return orders.reduce(
    (total, order) =>
      total + order.totalPrice,
    0
  );
}

export async function getRecentOrders(
  limit = 10
) {
  return prisma.order.findMany({
    take: limit,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },

      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
        },
      },
    },
  });
}

export async function getPopularProducts(
  limit = 10
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
    },

    take: limit,

    orderBy: {
      purchaseCount: "desc",
    },

    include: {
      category: true,
    },
  });
}

export async function getRevenueHistory(
  days = 30
) {
  const safeDays = Math.min(
    Math.max(days, 1),
    365
  );

  const from = new Date();

  from.setDate(
    from.getDate() - safeDays
  );

  from.setHours(
    0,
    0,
    0,
    0
  );

  const orders =
    await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",

        createdAt: {
          gte: from,
        },
      },

      select: {
        createdAt: true,
        totalPrice: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  const revenueMap =
    new Map<
      string,
      {
        revenue: number;
        orders: number;
      }
    >();

  for (const order of orders) {
    const date =
      order.createdAt
        .toISOString()
        .slice(0, 10);

    const current =
      revenueMap.get(date) ?? {
        revenue: 0,
        orders: 0,
      };

    current.revenue +=
      order.totalPrice;

    current.orders += 1;

    revenueMap.set(
      date,
      current
    );
  }

  return Array.from(
    revenueMap.entries()
  ).map(
    ([date, data]) => ({
      date,

      revenue:
        data.revenue,

      orders:
        data.orders,
    })
  );
}