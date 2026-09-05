import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/app/lib/auth/authorization";

import {
  addProductToFavorites,
  getUserFavorites,
} from "@/app/lib/favorites/favorite.service";

const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const searchParams = request.nextUrl.searchParams;

    const cursorParam = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");

    const cursor = cursorParam
      ? Number(cursorParam)
      : undefined;

    const limit = limitParam
      ? Number(limitParam)
      : 20;

    if (
      cursor !== undefined &&
      (!Number.isInteger(cursor) || cursor <= 0)
    ) {
      return NextResponse.json(
        {
          error: "Invalid cursor",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(limit) ||
      limit <= 0 ||
      limit > MAX_LIMIT
    ) {
      return NextResponse.json(
        {
          error: `Limit must be between 1 and ${MAX_LIMIT}`,
        },
        {
          status: 400,
        }
      );
    }

    const result = await getUserFavorites(user!.id, {
      cursor,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/favorites:", error);

    return NextResponse.json(
      {
        error: "Failed to get favorites",
      },
      {
        status: 500,
      }
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
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const productId = (body as {
      productId?: unknown;
    }).productId;

    if (
      typeof productId !== "number" ||
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    const favorite = await addProductToFavorites(
      user!.id,
      productId
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
    console.error("POST /api/favorites:", error);

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