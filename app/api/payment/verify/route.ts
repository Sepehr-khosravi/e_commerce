import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  verifyPayment,
} from "@/app/lib/payment/payment.service";

export async function GET(
  request: NextRequest
) {
  try {
    const authority =
      request.nextUrl.searchParams.get(
        "authority"
      );

    if (!authority) {
      return NextResponse.json(
        {
          error:
            "Payment authority is required",
        },
        {
          status: 400,
        }
      );
    }

    const payment =
      await verifyPayment(
        authority
      );

    return NextResponse.json({
      success: true,
      payment,
    });
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