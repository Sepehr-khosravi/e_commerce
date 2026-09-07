import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/app/lib/auth/authorization";

import {
  getOrders,
} from "@/app/lib/orders/order.service";

import type {
  OrderStatus,
  PaymentStatus,
} from "@/app/lib/orders/order.types";

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const MAX_LIMIT = 50;

export async function GET(
  request: NextRequest
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const { searchParams } =
      request.nextUrl;

    const statusParam =
      searchParams.get("status");

    const paymentStatusParam =
      searchParams.get(
        "paymentStatus"
      );

    const userIdParam =
      searchParams.get("userId");

    const cursorParam =
      searchParams.get("cursor");

    const limitParam =
      searchParams.get("limit");

    let userId:
      | number
      | undefined;

    if (userIdParam !== null) {
      userId = Number(userIdParam);

      if (
        !Number.isInteger(userId) ||
        userId <= 0
      ) {
        return NextResponse.json(
          {
            error: "Invalid user ID",
          },
          { status: 400 }
        );
      }
    }

    let cursor:
      | number
      | undefined;

    if (cursorParam !== null) {
      cursor = Number(cursorParam);

      if (
        !Number.isInteger(cursor) ||
        cursor <= 0
      ) {
        return NextResponse.json(
          {
            error: "Invalid cursor",
          },
          { status: 400 }
        );
      }
    }

    const limit =
      limitParam !== null
        ? Number(limitParam)
        : 20;

    if (
      !Number.isInteger(limit) ||
      limit <= 0 ||
      limit > MAX_LIMIT
    ) {
      return NextResponse.json(
        {
          error: `Limit must be between 1 and ${MAX_LIMIT}`,
        },
        { status: 400 }
      );
    }

    let status:
      | OrderStatus
      | undefined;

    if (statusParam !== null) {
      if (
        !orderStatuses.includes(
          statusParam as OrderStatus
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid order status",
          },
          { status: 400 }
        );
      }

      status =
        statusParam as OrderStatus;
    }

    let paymentStatus:
      | PaymentStatus
      | undefined;

    if (
      paymentStatusParam !== null
    ) {
      if (
        !paymentStatuses.includes(
          paymentStatusParam as PaymentStatus
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid payment status",
          },
          { status: 400 }
        );
      }

      paymentStatus =
        paymentStatusParam as PaymentStatus;
    }

    const result =
      await getOrders({
        userId,
        status,
        paymentStatus,
        cursor,
        limit,
      });

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "GET /api/admin/orders:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get orders",
      },
      { status: 500 }
    );
  }
}