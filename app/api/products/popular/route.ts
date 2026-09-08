import { NextResponse } from "next/server";

import { getPopularProducts } from "@/app/lib/products/product.service";

export async function GET() {
  try {
    const products = await getPopularProducts(10);

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error(
      "GET /api/products/popular error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch popular products",
      },
      {
        status: 500,
      }
    );
  }
}