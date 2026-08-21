import { NextResponse } from "next/server";

import { requireUser } from "@/app/lib/auth/authorization";

import {
  addProductToFavorites,
  isProductFavorite,
  removeProductFromFavorites,
} from "@/app/lib/favorites/favorite.service";

interface RouteContext {
  params: Promise<{
    productId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const { productId } = await context.params;

    const id = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    const favorite = await isProductFavorite(
      user!.id,
      id
    );

    return NextResponse.json({
      favorite,
    });
  } catch (error) {
    console.error(
      "GET /api/favorites/[productId]:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to check favorite",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const { productId } = await context.params;

    const id = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    const favorite =
      await addProductToFavorites(
        user!.id,
        id
      );

    return NextResponse.json(
      {
        favorite,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/favorites/[productId]:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to add favorite";

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
  _request: Request,
  context: RouteContext
) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const { productId } = await context.params;

    const id = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    await removeProductFromFavorites(
      user!.id,
      id
    );

    return NextResponse.json({
      message: "Product removed from favorites",
    });
  } catch (error) {
    console.error(
      "DELETE /api/favorites/[productId]:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to remove favorite",
      },
      {
        status: 400,
      }
    );
  }
}