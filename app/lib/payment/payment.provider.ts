import type {
  PaymentProvider,
  PaymentRequestResult,
  PaymentVerifyResult,
} from "./payment.types";

export class TestPaymentProvider
  implements PaymentProvider
{
  async requestPayment(data: {
    amount: number;
    callbackUrl: string;
    description?: string;
  }): Promise<PaymentRequestResult> {
    const authority =
      `TEST-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    /*
     * In a real provider this would be the
     * gateway payment URL.
     *
     * For the test provider we simply return
     * a local test URL.
     */
    const paymentUrl =
      `/api/payment/test/${authority}`;

    console.log(
      "Test payment created:",
      {
        authority,
        amount: data.amount,
        callbackUrl: data.callbackUrl,
        description: data.description,
      }
    );

    return {
      authority,
      paymentUrl,
    };
  }

  async verifyPayment(data: {
    authority: string;
    amount: number;
  }): Promise<PaymentVerifyResult> {
    console.log(
      "Test payment verified:",
      {
        authority: data.authority,
        amount: data.amount,
      }
    );

    return {
      success: true,
      referenceId:
        `TEST-TXN-${Date.now()}`,
      message:
        "Test payment verified successfully.",
    };
  }
}