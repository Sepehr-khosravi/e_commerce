import { NextResponse } from "next/server";

import { getCategoryById } from "@/app/lib/categories/category.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
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

    const category =
      await getCategoryById(categoryId);

    return NextResponse.json({
      category,
    });
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
      "GET /api/categories/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch category",
      },
      {
        status: 500,
      }
    );
  }
}