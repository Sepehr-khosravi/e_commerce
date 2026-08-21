import { NextRequest, NextResponse } from "next/server";

import { searchProducts } from "../../lib/products/product.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("q") ?? undefined;

    const categoryIdParam =
      searchParams.get("categoryId");

    const minPriceParam =
      searchParams.get("minPrice");

    const maxPriceParam =
      searchParams.get("maxPrice");

    const cursorParam =
      searchParams.get("cursor");

    const limitParam =
      searchParams.get("limit");

    const sortParam =
      searchParams.get("sort");

    const categoryId = categoryIdParam
      ? Number(categoryIdParam)
      : undefined;

    const minPrice = minPriceParam
      ? Number(minPriceParam)
      : undefined;

    const maxPrice = maxPriceParam
      ? Number(maxPriceParam)
      : undefined;

    const cursor = cursorParam
      ? Number(cursorParam)
      : undefined;

    const limit = limitParam
      ? Number(limitParam)
      : 20;

    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) ||
        categoryId <= 0)
    ) {
      return NextResponse.json(
        {
          error: "Invalid categoryId",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      return NextResponse.json(
        {
          error: "Invalid limit",
        },
        {
          status: 400,
        }
      );
    }

    const allowedSorts = [
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "popular",
    ] as const;

    type ProductSort =
      (typeof allowedSorts)[number];

    const sort = allowedSorts.includes(
      sortParam as ProductSort
    )
      ? (sortParam as ProductSort)
      : "newest";

    const result = await searchProducts({
      query,
      categoryId,
      minPrice,
      maxPrice,
      cursor,
      limit,
      sort,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/products error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}