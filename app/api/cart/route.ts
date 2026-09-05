import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/app/lib/auth/authorization";

import {
  addProductToCart,
  clearCart,
  getUserCart,
} from "@/app/lib/cart/cart.service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 20;

export async function GET(
  request: NextRequest
) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const { searchParams } =
      new URL(request.url);

    const rawLimit = searchParams.get("limit");
    const rawCursor = searchParams.get("cursor");

    const limit =
      rawLimit === null
        ? DEFAULT_LIMIT
        : Number(rawLimit);

    const cursor =
      rawCursor === null
        ? undefined
        : Number(rawCursor);

    if (
      !Number.isInteger(limit) ||
      limit <= 0 ||
      limit > MAX_LIMIT
    ) {
      return NextResponse.json(
        {
          error: `limit must be between 1 and ${MAX_LIMIT}`,
        },
        { status: 400 }
      );
    }

    if (
      cursor !== undefined &&
      (!Number.isInteger(cursor) || cursor <= 0)
    ) {
      return NextResponse.json(
        {
          error: "Invalid cursor",
        },
        { status: 400 }
      );
    }

    const cart = await getUserCart(user.id, {
      limit,
      cursor,
    });

    return NextResponse.json({
      cart,
    });
  } catch (error) {
    console.error("GET /api/cart:", error);

    return NextResponse.json(
      {
        error: "Failed to get cart",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    let body: unknown;

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

    if (
      typeof body !== "object" ||
      body === null ||
      !("productId" in body)
    ) {
      return NextResponse.json(
        {
          error: "productId is required",
        },
        { status: 400 }
      );
    }

    const rawProductId = (
      body as {
        productId?: unknown;
      }
    ).productId;

    const rawQuantity = (
      body as {
        quantity?: unknown;
      }
    ).quantity;

    const productId = Number(rawProductId);

    const quantity =
      rawQuantity === undefined
        ? 1
        : Number(rawQuantity);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid productId",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    const item = await addProductToCart(
      user.id,
      productId,
      quantity
    );

    return NextResponse.json(
      {
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cart:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to add product to cart";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    await clearCart(user.id);

    return NextResponse.json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("DELETE /api/cart:", error);

    return NextResponse.json(
      {
        error: "Failed to clear cart",
      },
      { status: 500 }
    );
  }
}