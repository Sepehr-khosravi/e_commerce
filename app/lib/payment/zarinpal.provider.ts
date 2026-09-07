import type {
  PaymentProvider,
  PaymentRequestResult,
  PaymentVerifyResult,
} from "./payment.types";

const BASE_URL = (
  process.env.ZARINPAL_BASE_URL ||
  "https://sandbox.zarinpal.com"
).replace(/\/$/, "");

const MERCHANT_ID =
  process.env.ZARINPAL_MERCHANT_ID;

const AMOUNT_MULTIPLIER = Number(
  process.env.ZARINPAL_AMOUNT_MULTIPLIER || "1"
);

if (!MERCHANT_ID) {
  throw new Error(
    "ZARINPAL_MERCHANT_ID is not configured"
  );
}

if (
  !Number.isFinite(AMOUNT_MULTIPLIER) ||
  AMOUNT_MULTIPLIER <= 0
) {
  throw new Error(
    "Invalid ZARINPAL_AMOUNT_MULTIPLIER"
  );
}

function toGatewayAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid payment amount");
  }

  return Math.round(
    amount * AMOUNT_MULTIPLIER
  );
}

async function parseResponse(response: Response) {
  const rawResponse = await response.text();

  if (!rawResponse) {
    throw new Error(
      `ZarinPal returned an empty response. HTTP ${response.status}`
    );
  }

  try {
    return JSON.parse(rawResponse);
  } catch {
    console.error(
      "ZarinPal invalid JSON response:",
      rawResponse
    );

    throw new Error(
      `ZarinPal returned invalid JSON. HTTP ${response.status}`
    );
  }
}

export class ZarinPalProvider
  implements PaymentProvider
{
  async requestPayment(
    data: {
      amount: number;
      callbackUrl: string;
      description?: string;
    }
  ): Promise<PaymentRequestResult> {
    const amount = toGatewayAmount(
      data.amount
    );

    if (
      typeof data.callbackUrl !== "string" ||
      !data.callbackUrl.trim()
    ) {
      throw new Error(
        "Invalid ZarinPal callback URL"
      );
    }

    const response = await fetch(
      `${BASE_URL}/pg/v4/payment/request.json`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          merchant_id: MERCHANT_ID,

          amount,

          currency: "IRR",

          description:
            data.description ||
            "E-commerce order",

          callback_url:
            data.callbackUrl,
        }),
      }
    );

    let result;

    try {
      result = await parseResponse(response);
    } catch (error) {
      console.error(
        "ZarinPal request parsing error:",
        error
      );

      throw error;
    }

    if (!response.ok) {
      console.error(
        "ZarinPal request failed:",
        {
          status: response.status,
          result,
        }
      );

      throw new Error(
        result?.errors?.message ||
          result?.data?.message ||
          `ZarinPal request failed with HTTP ${response.status}`
      );
    }

    const code =
      result?.data?.code;

    if (code !== 100) {
      console.error(
        "ZarinPal payment request rejected:",
        result
      );

      throw new Error(
        result?.data?.message ||
          result?.errors?.message ||
          `ZarinPal could not create payment. Code: ${code}`
      );
    }

    const authority =
      result?.data?.authority;

    if (
      typeof authority !== "string" ||
      !authority.trim()
    ) {
      console.error(
        "ZarinPal did not return authority:",
        result
      );

      throw new Error(
        "ZarinPal did not return an authority"
      );
    }

    return {
      authority,

      paymentUrl:
        `${BASE_URL}/pg/StartPay/${authority}`,
    };
  }

  async verifyPayment(
    data: {
      authority: string;
      amount: number;
    }
  ): Promise<PaymentVerifyResult> {
    if (
      typeof data.authority !== "string" ||
      !data.authority.trim()
    ) {
      throw new Error(
        "Invalid payment authority"
      );
    }

    const amount = toGatewayAmount(
      data.amount
    );

    const response = await fetch(
      `${BASE_URL}/pg/v4/payment/verify.json`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          merchant_id: MERCHANT_ID,

          amount,

          authority:
            data.authority,
        }),
      }
    );

    let result;

    try {
      result = await parseResponse(response);
    } catch (error) {
      console.error(
        "ZarinPal verification parsing error:",
        error
      );

      throw error;
    }

    if (!response.ok) {
      console.error(
        "ZarinPal verification request failed:",
        {
          status: response.status,
          result,
        }
      );

      throw new Error(
        result?.errors?.message ||
          result?.data?.message ||
          `ZarinPal verification failed with HTTP ${response.status}`
      );
    }

    const code =
      result?.data?.code;

    /*
     * 100 = payment successfully verified
     *
     * 101 = payment was already verified
     */
    if (
      code === 100 ||
      code === 101
    ) {
      return {
        success: true,

        referenceId:
          result?.data?.ref_id !==
          undefined &&
          result?.data?.ref_id !== null
            ? String(
                result.data.ref_id
              )
            : undefined,

        message:
          result?.data?.message,
      };
    }

    return {
      success: false,

      message:
        result?.data?.message ||
        result?.errors?.message ||
        `Payment verification failed. Code: ${code}`,
    };
  }
}