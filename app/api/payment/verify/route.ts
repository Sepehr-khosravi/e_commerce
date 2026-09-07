import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyPayment,
  cancelPayment,
} from "@/app/lib/payment/payment.service";

export async function GET(
  request: NextRequest
) {
  try {
    const authority =
      request.nextUrl.searchParams.get(
        "Authority"
      );

    const status =
      request.nextUrl.searchParams.get(
        "Status"
      );

    if (!authority) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment authority is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * If the user cancelled the payment
     * on ZarinPal, only the payment attempt
     * becomes FAILED.
     *
     * The Order remains PENDING and can be
     * paid again.
     */
    if (
      status &&
      status.toUpperCase() !== "OK"
    ) {
      const result =
        await cancelPayment(
          authority
        );

      return NextResponse.json(
        result
      );
    }

    /*
     * Status=OK is NOT enough to trust.
     *
     * verifyPayment() actually contacts
     * ZarinPal and verifies the authority.
     */
    const result =
      await verifyPayment(
        authority
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "GET /api/payment/verify:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      {
        status: 400,
      }
    );
  }
}