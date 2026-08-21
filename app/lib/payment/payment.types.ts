export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export interface CreatePaymentData {
  orderId: number;
  amount: number;
  description?: string;
  callbackUrl: string;
}

export interface PaymentRequestResult {
  authority: string;
  paymentUrl: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  transactionId?: string;
  authority: string;
}

export interface PaymentProvider {
  createPayment(
    data: CreatePaymentData
  ): Promise<PaymentRequestResult>;

  verifyPayment(
    authority: string,
    amount: number
  ): Promise<PaymentVerifyResult>;
}