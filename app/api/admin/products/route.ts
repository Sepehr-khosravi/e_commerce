import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  createNewProduct,
} from "@/app/lib/products/product.service";

export async function POST(request: NextRequest) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const body = await request.json();

    const price = Number(body.price);
    const categoryId = Number(body.categoryId);
    const count =
      body.count === undefined
        ? 0
        : Number(body.count);

    const offer =
      body.offer === undefined ||
      body.offer === null ||
      body.offer === ""
        ? null
        : Number(body.offer);

    if (
      typeof body.title !== "string" ||
      !body.title.trim()
    ) {
      return NextResponse.json(
        {
          error: "Title is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof body.slug !== "string" ||
      !body.slug.trim()
    ) {
      return NextResponse.json(
        {
          error: "Slug is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          error: "Invalid price",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid categoryId",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(count) ||
      count < 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid stock count",
        },
        { status: 400 }
      );
    }

    if (
      offer !== null &&
      (!Number.isFinite(offer) || offer < 0)
    ) {
      return NextResponse.json(
        {
          error: "Invalid offer",
        },
        { status: 400 }
      );
    }

    const images = Array.isArray(body.images)
      ? body.images.filter(
          (image: unknown): image is string =>
            typeof image === "string"
        )
      : [];

    const description =
      typeof body.description === "string"
        ? body.description
        : "";

    const product = await createNewProduct({
      title: body.title.trim(),
      slug: body.slug.trim(),
      price,
      offer,
      images,
      description,
      categoryId,
      count,
      isFeatured:
        typeof body.isFeatured === "boolean"
          ? body.isFeatured
          : false,
      isActive:
        typeof body.isActive === "boolean"
          ? body.isActive
          : true,
    });

    return NextResponse.json(
      {
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/products:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create product",
      },
      { status: 500 }
    );
  }
}