// app/api/admin/products/search/route.ts

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";
import { searchProducts } from "@/app/lib/products/product.service";

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("q")?.trim() ?? "";

    const categoryIdParam = searchParams.get("categoryId");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sortParam = searchParams.get("sort");
    const cursor = searchParams.get("cursor") ?? undefined;
    const limitParam = searchParams.get("limit");

    if (!query) {
      return NextResponse.json({
        products: [],
      });
    }

    const categoryId = categoryIdParam
      ? Number(categoryIdParam)
      : undefined;

    const minPrice = minPriceParam
      ? Number(minPriceParam)
      : undefined;

    const maxPrice = maxPriceParam
      ? Number(maxPriceParam)
      : undefined;

    const limit = limitParam
      ? Number(limitParam)
      : 20;

    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) || categoryId <= 0)
    ) {
      return NextResponse.json(
        { message: "Invalid categoryId" },
        { status: 400 }
      );
    }

    if (
      minPrice !== undefined &&
      (!Number.isFinite(minPrice) || minPrice < 0)
    ) {
      return NextResponse.json(
        { message: "Invalid minPrice" },
        { status: 400 }
      );
    }

    if (
      maxPrice !== undefined &&
      (!Number.isFinite(maxPrice) || maxPrice < 0)
    ) {
      return NextResponse.json(
        { message: "Invalid maxPrice" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return NextResponse.json(
        { message: "limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    const allowedSorts = [
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
    ] as const;

    type ProductSortValue = (typeof allowedSorts)[number];

    const sort = allowedSorts.includes(
      sortParam as ProductSortValue
    )
      ? (sortParam as ProductSortValue)
      : "newest";

    const result = await searchProducts({
      query,
      categoryId,
      minPrice,
      maxPrice,
      sort,
      cursor,
      limit,
      includeInactive: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin product search error:", error);

    return NextResponse.json(
      {
        message: "Failed to search products",
      },
      {
        status: 500,
      }
    );
  }
}