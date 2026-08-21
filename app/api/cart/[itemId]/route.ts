import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/app/lib/auth/authorization";

import {
  removeProductFromCart,
  updateCartItem,
} from "@/app/lib/cart/cart.service";

interface RouteContext {
  params: Promise<{
    itemId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const { itemId } = await context.params;

    const cartItemId = Number(itemId);

    if (
      !Number.isInteger(cartItemId) ||
      cartItemId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid cart item ID",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const quantity = Number(body.quantity);

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

    const item = await updateCartItem(
      user!.id,
      cartItemId,
      quantity
    );

    return NextResponse.json({
      item,
    });
  } catch (error) {
    console.error(
      "PATCH /api/cart/[itemId]:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update cart item";

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

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const { itemId } = await context.params;

    const cartItemId = Number(itemId);

    if (
      !Number.isInteger(cartItemId) ||
      cartItemId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid cart item ID",
        },
        {
          status: 400,
        }
      );
    }

    await removeProductFromCart(
      user!.id,
      cartItemId
    );

    return NextResponse.json({
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error(
      "DELETE /api/cart/[itemId]:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove cart item";

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