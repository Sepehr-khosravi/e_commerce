export interface PaymentRequestResult {
  authority: string;
  paymentUrl: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  referenceId?: string;
  message?: string;
}

export interface PaymentProvider {
  requestPayment(data: {
    amount: number;
    callbackUrl: string;
    description?: string;
  }): Promise<PaymentRequestResult>;

  verifyPayment(data: {
    authority: string;
    amount: number;
  }): Promise<PaymentVerifyResult>;
}