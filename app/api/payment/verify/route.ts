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
        "Authority"
      );

    const status =
      request.nextUrl.searchParams.get(
        "Status"
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

    if (
      status &&
      status.toUpperCase() !==
        "OK"
    ) {
      return NextResponse.json({
        success: false,

        status:
          "CANCELLED",

        message:
          "Payment was cancelled.",
      });
    }

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