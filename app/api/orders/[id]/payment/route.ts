import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/app/lib/auth/current-user";
import { requestPaymentForUser } from "@/app/lib/payment/payment.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    /*
     * CSRF protection:
     * This endpoint changes payment state / creates a payment attempt.
     *
     * We only accept requests originating from our own application.
     */
    const origin = request.headers.get("origin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (appUrl && origin) {
      const normalizedAppUrl = appUrl.replace(/\/$/, "");
      const normalizedOrigin = origin.replace(/\/$/, "");

      if (normalizedOrigin !== normalizedAppUrl) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid request origin",
          },
          { status: 403 }
        );
      }
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     *
     * We intentionally do NOT accept:
     *
     * - userId
     * - amount
     * - price
     * - payment status
     *
     * from the client.
     *
     * Everything is verified by the payment service.
     */
    const result = await requestPaymentForUser(
      user.id,
      orderId
    );

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
    });
  } catch (error) {
    console.error(
      "POST /api/orders/[id]/payment:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to start payment";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}