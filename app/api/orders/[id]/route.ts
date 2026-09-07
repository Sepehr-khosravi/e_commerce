import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/app/lib/auth/current-user";

import {
  getOrderByUser,
} from "@/app/lib/orders/order.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
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

    const { id } =
      await context.params;

    const orderId =
      Number(id);

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

    const order =
      await getOrderByUser(
        orderId,
        user.id
      );

    return NextResponse.json({
      order,
    });
  } catch (error) {
    console.error(
      "GET /api/orders/[id]:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get order";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          message ===
          "Order not found"
            ? 404
            : 500,
      }
    );
  }
}