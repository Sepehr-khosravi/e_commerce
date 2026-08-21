import { NextRequest, NextResponse } from "next/server";

import { getFeaturedProducts } from "@/app/lib/products/product.service";

export async function GET(
  request: NextRequest
) {
  try {
    const limitParam =
      request.nextUrl.searchParams.get("limit");

    const limit = limitParam
      ? Number(limitParam)
      : 10;

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

    const products =
      await getFeaturedProducts(limit);

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error(
      "GET /api/products/featured error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch featured products",
      },
      {
        status: 500,
      }
    );
  }
}