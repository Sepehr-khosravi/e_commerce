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

    const cart = await getUserCart(user!.id);

    return NextResponse.json({
      cart,
    });
  } catch (error) {
    console.error("GET /api/cart:", error);

    return NextResponse.json(
      {
        error: "Failed to get cart",
      },
      {
        status: 500,
      }
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

    const body = await request.json();

    const productId = Number(body.productId);
    const quantity = Number(body.quantity ?? 1);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid productId",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    const item = await addProductToCart(
      user!.id,
      productId,
      quantity
    );

    return NextResponse.json(
      {
        item,
      },
      {
        status: 201,
      }
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
      {
        status: 400,
      }
    );
  }
}

export async function DELETE() {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    await clearCart(user!.id);

    return NextResponse.json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("DELETE /api/cart:", error);

    return NextResponse.json(
      {
        error: "Failed to clear cart",
      },
      {
        status: 500,
      }
    );
  }
}