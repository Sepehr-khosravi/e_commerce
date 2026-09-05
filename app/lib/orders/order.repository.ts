import { prisma } from "../prisma";

import type {
  CreateOrderRecordData,
  GetOrdersOptions,
  OrderStatus,
  PaymentStatus,
} from "./order.types";

export async function createOrder(
  data: CreateOrderRecordData
) {
  return prisma.$transaction(
    async (tx) => {
      /*
       * Reserve stock atomically.
       *
       * If any product doesn't have enough stock,
       * the entire transaction is rolled back.
       */
      for (const item of data.items) {
        const result =
          await tx.product.updateMany({
            where: {
              id: item.productId,
              isActive: true,
              count: {
                gte: item.quantity,
              },
            },
            data: {
              count: {
                decrement: item.quantity,
              },
            },
          });

        if (result.count !== 1) {
          throw new Error(
            `Product "${item.productTitle}" is no longer available in the requested quantity`
          );
        }
      }

      return tx.order.create({
        data: {
          userId: data.userId,

          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,

          totalPrice: data.totalPrice,

          status: "PENDING",
          paymentStatus: "PENDING",

          items: {
            create: data.items.map(
              (item) => ({
                productId:
                  item.productId,

                productTitle:
                  item.productTitle,

                productPrice:
                  item.productPrice,

                productOffer:
                  item.offer,

                quantity:
                  item.quantity,

                totalPrice:
                  item.totalPrice,
              })
            ),
          },
        },

        include: {
          items: true,
        },
      });
    }
  );
}

/*
 * Get ONE order belonging to ONE specific user.
 *
 * The userId is part of the database query itself.
 * Therefore a user cannot access another user's order
 * even if they know its ID.
 */
export async function findOrderByUser(
  orderId: number,
  userId: number
) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },

    include: {
      items: true,
      payments: true,
    },
  });
}

/*
 * Get orders ONLY for a specific user.
 */
export async function findOrdersByUser(
  userId: number,
  limit: number,
  cursor?: number
) {
  const orders =
    await prisma.order.findMany({
      where: {
        userId,
      },

      orderBy: {
        id: "desc",
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

      include: {
        items: true,
      },
    });

  const hasMore =
    orders.length > limit;

  if (hasMore) {
    orders.pop();
  }

  const nextCursor =
    hasMore && orders.length > 0
      ? orders[orders.length - 1].id
      : null;

  return {
    orders,
    nextCursor,
    hasMore,
  };
}

/*
 * ADMIN ONLY
 *
 * Get orders from all users.
 *
 * This function must NEVER be called
 * from the normal user order API.
 */
export async function findOrders(
  options: GetOrdersOptions
) {
  const {
    userId,
    status,
    paymentStatus,
    cursor,
    limit = 20,
  } = options;

  const orders =
    await prisma.order.findMany({
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

      orderBy: {
        id: "desc",
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

      include: {
        items: true,

        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

  const hasMore =
    orders.length > limit;

  if (hasMore) {
    orders.pop();
  }

  const nextCursor =
    hasMore && orders.length > 0
      ? orders[orders.length - 1].id
      : null;

  return {
    orders,
    nextCursor,
    hasMore,
  };
}

/*
 * Cancel an unpaid order and restore
 * its reserved stock.
 */
export async function cancelOrderAndRestoreStock(
  orderId: number
) {
  return prisma.$transaction(
    async (tx) => {
      const order =
        await tx.order.findUnique({
          where: {
            id: orderId,
          },

          include: {
            items: true,
          },
        });

      if (!order) {
        throw new Error(
          "Order not found"
        );
      }

      if (
        order.paymentStatus ===
        "PAID"
      ) {
        throw new Error(
          "Paid order cannot be cancelled this way"
        );
      }

      if (
        order.status ===
        "CANCELLED"
      ) {
        return order;
      }

      for (const item of order.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            count: {
              increment:
                item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: {
          id: orderId,
        },

        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
        },
      });
    }
  );
}

export async function findOrderById(
  orderId: number
) {
  return prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
      payments: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
    },
  });
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
) {
  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
    include: {
      items: true,
      payments: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
    },
  });
}

export async function updatePaymentStatus(
  orderId: number,
  paymentStatus: PaymentStatus
) {
  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      paymentStatus,
    },
    include: {
      items: true,
      payments: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
    },
  });
}