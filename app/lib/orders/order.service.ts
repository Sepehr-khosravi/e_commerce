import {
  createOrder,
  findOrderById,
  findOrderByUser,
  findOrders,
  findOrdersByUser,
  updateOrderStatus,
  updatePaymentStatus,
} from "./order.repository";

import type {
  CreateOrderData,
  GetOrdersOptions,
  OrderStatus,
  PaymentStatus,
} from "./order.types";

import { getUserCart } from "../cart/cart.service";

function roundMoney(value: number) {
  return (
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );
}

/*
 * Create order
 */
export async function createNewOrder(
  userId: number,
  data: CreateOrderData
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const phone = data.phone.trim();
  const address = data.address.trim();

  if (!firstName) {
    throw new Error("First name is required");
  }

  if (!lastName) {
    throw new Error("Last name is required");
  }

  if (!/^09\d{9}$/.test(phone)) {
    throw new Error(
      "Please enter your phone number using English digits only."
    );
  }

  if (!address) {
    throw new Error("Address is required");
  }

  if (address.length > 2000) {
    throw new Error("Address is too long");
  }

  const cart = await getUserCart(userId);

  if (!cart.items.length) {
    throw new Error("Your cart is empty");
  }

  if (cart.items.length > 100) {
    throw new Error("Too many items in cart");
  }

  const orderItems: Array<{
    productId: number;
    productTitle: string;
    productPrice: number;
    offer: number;
    quantity: number;
    totalPrice: number;
  }> = [];

  let orderTotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      throw new Error(
        "A product in your cart no longer exists"
      );
    }

    if (!product.isActive) {
      throw new Error(
        `${product.title} is no longer available`
      );
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error(
        `Invalid quantity for ${product.title}`
      );
    }

    const price = Number(product.price);

    const offer =
      product.offer === null
        ? 0
        : Number(product.offer);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(
        `Invalid price for ${product.title}`
      );
    }

    if (
      !Number.isFinite(offer) ||
      offer < 0 ||
      offer > 100
    ) {
      throw new Error(
        `Invalid discount for ${product.title}`
      );
    }

    const finalPrice = roundMoney(
      price * (1 - offer / 100)
    );

    const totalPrice = roundMoney(
      finalPrice * item.quantity
    );

    orderTotal = roundMoney(
      orderTotal + totalPrice
    );

    orderItems.push({
      productId: product.id,
      productTitle: product.title,
      productPrice: price,
      offer: roundMoney(offer),
      quantity: item.quantity,
      totalPrice,
    });
  }

  const order = await createOrder({
    userId,
    firstName,
    lastName,
    phone,
    address,
    totalPrice: orderTotal,
    items: orderItems,
  });

  return {
    orderId: order.id,
    totalPrice: Number(order.totalPrice),
    status: order.status,
    paymentStatus: order.paymentStatus,
  };
}

/*
 * Get one order for the owner
 */
export async function getOrderByUser(
  orderId: number,
  userId: number
) {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("Invalid order ID");
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const order = await findOrderByUser(
    orderId,
    userId
  );

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
}

/*
 * Get one order
 * ADMIN ONLY
 *
 * Authorization is handled by the API route.
 */
export async function getOrderById(
  orderId: number
) {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("Invalid order ID");
  }

  const order = await findOrderById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
}

/*
 * Change order status
 * ADMIN ONLY
 */
export async function changeOrderStatus(
  orderId: number,
  status: OrderStatus
) {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("Invalid order ID");
  }

  const validStatuses: OrderStatus[] = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  const order =
    await findOrderById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  return updateOrderStatus(
    orderId,
    status
  );
}

/*
 * Change payment status
 * ADMIN ONLY
 */
export async function changePaymentStatus(
  orderId: number,
  paymentStatus: PaymentStatus
) {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("Invalid order ID");
  }

  const validStatuses: PaymentStatus[] = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
  ];

  if (!validStatuses.includes(paymentStatus)) {
    throw new Error("Invalid payment status");
  }

  const order =
    await findOrderById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  return updatePaymentStatus(
    orderId,
    paymentStatus
  );
}

/*
 * Normal user orders
 */
export async function getOrdersByUser(
  userId: number,
  limit = 20,
  cursor?: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  if (
    !Number.isInteger(limit) ||
    limit <= 0 ||
    limit > 50
  ) {
    throw new Error("Invalid limit");
  }

  if (
    cursor !== undefined &&
    (!Number.isInteger(cursor) || cursor <= 0)
  ) {
    throw new Error("Invalid cursor");
  }

  return findOrdersByUser(
    userId,
    limit,
    cursor
  );
}

/*
 * ADMIN ONLY
 */
export async function getOrders(
  options: GetOrdersOptions
) {
  const {
    userId,
    status,
    paymentStatus,
    cursor,
    limit = 20,
  } = options;

  if (
    userId !== undefined &&
    (!Number.isInteger(userId) || userId <= 0)
  ) {
    throw new Error("Invalid user ID");
  }

  if (
    !Number.isInteger(limit) ||
    limit <= 0 ||
    limit > 50
  ) {
    throw new Error(
      "Order page size must be between 1 and 50"
    );
  }

  if (
    cursor !== undefined &&
    (!Number.isInteger(cursor) || cursor <= 0)
  ) {
    throw new Error("Invalid cursor");
  }

  return findOrders({
    userId,
    status,
    paymentStatus,
    cursor,
    limit,
  });
}