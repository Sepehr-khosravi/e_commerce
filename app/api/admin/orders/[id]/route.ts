import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/app/lib/auth/authorization";

import {
  changeOrderStatus,
  changePaymentStatus,
  getOrderById,
} from "@/app/lib/orders/order.service";

import type {
  OrderStatus,
  PaymentStatus,
} from "@/app/lib/orders/order.types";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const { id } =
      await context.params;

    const orderId = Number(id);

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    const order =
      await getOrderById(orderId);

    return NextResponse.json({
      order,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/orders/[id]:",
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
          message === "Order not found"
            ? 404
            : 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const { id } =
      await context.params;

    const orderId = Number(id);

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    let body: {
      status?: unknown;
      paymentStatus?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON body",
        },
        { status: 400 }
      );
    }

    const hasStatus =
      body.status !== undefined;

    const hasPaymentStatus =
      body.paymentStatus !== undefined;

    if (
      !hasStatus &&
      !hasPaymentStatus
    ) {
      return NextResponse.json(
        {
          error: "Nothing to update",
        },
        { status: 400 }
      );
    }

    let order;

    /*
     * Update order status
     */
    if (hasStatus) {
      if (
        typeof body.status !== "string" ||
        !orderStatuses.includes(
          body.status as OrderStatus
        )
      ) {
        return NextResponse.json(
          {
            error: "Invalid order status",
          },
          { status: 400 }
        );
      }

      order =
        await changeOrderStatus(
          orderId,
          body.status as OrderStatus
        );
    }

    /*
     * Update payment status
     */
    if (hasPaymentStatus) {
      if (
        typeof body.paymentStatus !== "string" ||
        !paymentStatuses.includes(
          body.paymentStatus as PaymentStatus
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

      order =
        await changePaymentStatus(
          orderId,
          body.paymentStatus as PaymentStatus
        );
    }

    if (!order) {
      throw new Error(
        "Order update failed"
      );
    }

    return NextResponse.json({
      order,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/orders/[id]:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update order";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          message === "Order not found"
            ? 404
            : 500,
      }
    );
  }
}