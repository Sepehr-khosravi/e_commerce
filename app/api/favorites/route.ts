import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/app/lib/auth/authorization";

import {
  getUserFavorites,
} from "@/app/lib/favorites/favorite.service";

export async function GET(
  request: NextRequest
) {
  try {
    const { user, response } = await requireUser();

    if (response) {
      return response;
    }

    const searchParams =
      request.nextUrl.searchParams;

    const cursorParam =
      searchParams.get("cursor");

    const limitParam =
      searchParams.get("limit");

    const cursor = cursorParam
      ? Number(cursorParam)
      : undefined;

    const limit = limitParam
      ? Number(limitParam)
      : 20;

    if (
      cursor !== undefined &&
      (!Number.isInteger(cursor) ||
        cursor <= 0)
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

    if (!Number.isInteger(limit) || limit <= 0) {
      return NextResponse.json(
        {
          error: "Invalid limit",
        },
        {
          status: 400,
        }
      );
    }

    const result = await getUserFavorites(
      user!.id,
      {
        cursor,
        limit,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/favorites:",
      error
    );

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