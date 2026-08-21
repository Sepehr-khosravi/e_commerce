import { prisma } from "../prisma";

import type {
  SearchOrdersOptions,
  OrderStatus,
  PaymentStatus,
} from "./order.types";

export async function findOrderById(
  id: number
) {
  return prisma.order.findUnique({
    where: {
      id,
    },

    include: {
      user: true,

      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function findOrders(
  options: SearchOrdersOptions
) {
  const {
    userId,
    status,
    paymentStatus,
    cursor,
    limit = 20,
  } = options;

  const orders = await prisma.order.findMany({
    where: {
      ...(userId !== undefined
        ? {
            userId,
          }
        : {}),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(paymentStatus
        ? {
            paymentStatus,
          }
        : {}),
    },

    take: limit + 1,

    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },

          skip: 1,
        }
      : {}),

    orderBy: {
      id: "desc",
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const hasNextPage =
    orders.length > limit;

  if (hasNextPage) {
    orders.pop();
  }

  const nextCursor =
    hasNextPage && orders.length > 0
      ? orders[orders.length - 1].id
      : null;

  return {
    orders,
    nextCursor,
    hasNextPage,
  };
}

export async function findUserOrders(
  userId: number,
  limit = 20,
  cursor?: number
) {
  return findOrders({
    userId,
    limit,
    cursor,
  });
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus
) {
  return prisma.order.update({
    where: {
      id,
    },

    data: {
      status,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function updatePaymentStatus(
  id: number,
  status: PaymentStatus
) {
  return prisma.order.update({
    where: {
      id,
    },

    data: {
      paymentStatus: status,
    },

    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}