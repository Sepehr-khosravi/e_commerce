export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface CreateOrderData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export interface CreateOrderItemData {
  productId: number;
  productTitle: string;
  productPrice: number;
  offer: number;
  quantity: number;
  totalPrice: number;
}

export interface CreateOrderRecordData {
  userId: number;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  totalPrice: number;
  items: CreateOrderItemData[];
}

export interface GetOrdersOptions {
  userId?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  cursor?: number;
  limit?: number;
}