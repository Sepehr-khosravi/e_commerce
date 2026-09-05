import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/app/lib/auth/current-user";

import {
  requestPaymentForUser,
} from "@/app/lib/payment/payment.service";

export async function POST(
  request: NextRequest
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const orderId =
      Number(body.orderId);

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid order ID",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await requestPaymentForUser(
        user.id,
        orderId
      );

    return NextResponse.json(
      result,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/payment/request:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment request failed",
      },
      {
        status: 400,
      }
    );
  }
}