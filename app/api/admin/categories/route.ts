// app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { getCurrentUser } from "@/app/lib/auth/current-user";
import {
  createNewCategory,
} from "@/app/lib/categories/category.service";

export async function POST(
  request: NextRequest
) {
  // Declare body outside try block so it's accessible in catch
  let body: any;
  let name = "";
  let slug = "";

  try {
    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 2. Check admin permission
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    // 3. Parse request body
    body = await request.json();

    // 4. Validate category name
    if (
      typeof body.name !== "string" ||
      !body.name.trim() || typeof body.slug !== "string" || !body.slug.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 }
      );
    }

    name = body.name.trim();
    slug = body.slug.trim();
    const description : string | null = body.description.trim();

    // 5. Create category
    const category = await createNewCategory({
      name,
      slug,
      description : description ? description : ""
    });

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/categories:",
      error
    );

    // Handle Prisma unique constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target?.includes('name')) {
          return NextResponse.json(
            {
              success: false,
              message: `Category with name "${name}" already exists`,
            },
            { status: 409 }
          );
        }
        if (target?.includes('slug')) {
          return NextResponse.json(
            {
              success: false,
              message: `Category with slug "${slug}" already exists`,
            },
            { status: 409 }
          );
        }
      }
    }

    // Handle custom errors from service
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create category",
      },
      { status: 500 }
    );
  }
}