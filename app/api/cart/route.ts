import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/app/lib/auth/authorization";

import {
  addProductToCart,
  clearCart,
  getUserCart,
} from "@/app/lib/cart/cart.service";

export async function GET() {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const cart = await getUserCart(user.id);

    return NextResponse.json({ cart });
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

export async function POST(request: NextRequest) {
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
      body as { productId?: unknown }
    ).productId;

    const rawQuantity = (
      body as { quantity?: unknown }
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
      { item },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cart:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to add product to cart";

    return NextResponse.json(
      { error: message },
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