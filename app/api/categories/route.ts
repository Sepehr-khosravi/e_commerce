import { NextRequest, NextResponse } from "next/server";

import { getCategories } from "@/app/lib/categories/category.service";

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const query =
      searchParams.get("q") ?? undefined;

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

    const result = await getCategories({
      query,
      cursor,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/categories error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}