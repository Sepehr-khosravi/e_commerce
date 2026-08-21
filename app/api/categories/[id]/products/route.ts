import { NextRequest, NextResponse } from "next/server";

import { getCategoryProducts } from "@/app/lib/categories/category.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const categoryId = Number(id);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
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

    const result =
      await getCategoryProducts(
        categoryId,
        cursor,
        limit
      );

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Category not found"
    ) {
      return NextResponse.json(
        {
          error: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    console.error(
      "GET /api/categories/[id]/products error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch category products",
      },
      {
        status: 500,
      }
    );
  }
}