export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface CreateOrderData {
  userId: number;

  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
}

export interface UpdatePaymentStatusData {
  status: PaymentStatus;
}

export interface SearchOrdersOptions {
  userId?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  cursor?: number;
  limit?: number;
}

export interface AdminOrderListOptions {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  query?: string;
}