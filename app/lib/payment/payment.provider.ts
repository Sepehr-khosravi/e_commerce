import type {
  CreatePaymentData,
  PaymentProvider,
} from "./payment.types";

export class TestPaymentProvider
  implements PaymentProvider
{
  async createPayment(
    data: CreatePaymentData
  ) {
    const authority =
      `TEST-${data.orderId}-${Date.now()}`;

    return {
      authority,

      paymentUrl:
        `/api/payment/test/${authority}`,
    };
  }

  async verifyPayment(
    authority: string,
    _amount: number
  ) {
    return {
      success: true,

      transactionId:
        `TEST-TXN-${Date.now()}`,

      authority,
    };
  }
}