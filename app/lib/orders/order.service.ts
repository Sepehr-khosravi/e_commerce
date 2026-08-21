import {
  findOrderById,
  findOrders,
  findUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "./order.repository";

import type {
  OrderStatus,
  PaymentStatus,
  SearchOrdersOptions,
} from "./order.types";

export async function getOrderById(
  id: number
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error("Invalid order ID");
  }

  const order = await findOrderById(id);

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
}

export async function getOrders(
  options: SearchOrdersOptions
) {
  const limit = Math.min(
    Math.max(options.limit ?? 20, 1),
    100
  );

  return findOrders({
    ...options,
    limit,
  });
}

export async function getOrdersByUser(
  userId: number,
  limit = 20,
  cursor?: number
) {
  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    throw new Error("Invalid user ID");
  }

  const safeLimit = Math.min(
    Math.max(limit, 1),
    100
  );

  return findUserOrders(
    userId,
    safeLimit,
    cursor
  );
}

export async function changeOrderStatus(
  id: number,
  status: OrderStatus
) {
  await getOrderById(id);

  return updateOrderStatus(
    id,
    status
  );
}

export async function changePaymentStatus(
  id: number,
  status: PaymentStatus
) {
  await getOrderById(id);

  return updatePaymentStatus(
    id,
    status
  );
}