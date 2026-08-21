import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  deactivateProduct,
  editProduct,
  getProductById,
  permanentlyRemoveProduct,
} from "@/app/lib/products/product.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const { id } = await context.params;

    const productId = Number(id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const product =
      await getProductById(productId);

    return NextResponse.json({
      product,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/products/[id]:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to get product";

    return NextResponse.json(
      { error: message },
      {
        status:
          message === "Product not found"
            ? 404
            : 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const { id } = await context.params;

    const productId = Number(id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const data: {
      title?: string;
      slug?: string;
      price?: number;
      offer?: number | null;
      images?: string[];
      description?: string;
      categoryId?: number;
      count?: number;
      isFeatured?: boolean;
      isActive?: boolean;
    } = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string"
      ) {
        return NextResponse.json(
          {
            error: "Invalid title",
          },
          { status: 400 }
        );
      }

      data.title = body.title.trim();
    }

    if (body.slug !== undefined) {
      if (
        typeof body.slug !== "string"
      ) {
        return NextResponse.json(
          {
            error: "Invalid slug",
          },
          { status: 400 }
        );
      }

      data.slug = body.slug.trim();
    }

    if (body.price !== undefined) {
      const price = Number(body.price);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return NextResponse.json(
          {
            error: "Invalid price",
          },
          { status: 400 }
        );
      }

      data.price = price;
    }

    if (body.offer !== undefined) {
      if (
        body.offer === null ||
        body.offer === ""
      ) {
        data.offer = null;
      } else {
        const offer = Number(body.offer);

        if (
          !Number.isFinite(offer) ||
          offer < 0
        ) {
          return NextResponse.json(
            {
              error: "Invalid offer",
            },
            { status: 400 }
          );
        }

        data.offer = offer;
      }
    }

    if (body.images !== undefined) {
      if (!Array.isArray(body.images)) {
        return NextResponse.json(
          {
            error: "Images must be an array",
          },
          { status: 400 }
        );
      }

      data.images = body.images.filter(
        (image: unknown): image is string =>
          typeof image === "string"
      );
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string"
      ) {
        return NextResponse.json(
          {
            error: "Invalid description",
          },
          { status: 400 }
        );
      }

      data.description =
        body.description;
    }

    if (body.categoryId !== undefined) {
      const categoryId = Number(
        body.categoryId
      );

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

      data.categoryId = categoryId;
    }

    if (body.count !== undefined) {
      const count = Number(body.count);

      if (
        !Number.isInteger(count) ||
        count < 0
      ) {
        return NextResponse.json(
          {
            error: "Invalid count",
          },
          { status: 400 }
        );
      }

      data.count = count;
    }

    if (body.isFeatured !== undefined) {
      if (
        typeof body.isFeatured !== "boolean"
      ) {
        return NextResponse.json(
          {
            error: "Invalid isFeatured",
          },
          { status: 400 }
        );
      }

      data.isFeatured =
        body.isFeatured;
    }

    if (body.isActive !== undefined) {
      if (
        typeof body.isActive !== "boolean"
      ) {
        return NextResponse.json(
          {
            error: "Invalid isActive",
          },
          { status: 400 }
        );
      }

      data.isActive =
        body.isActive;
    }

    const product = await editProduct(
      productId,
      data
    );

    return NextResponse.json({
      product,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/products/[id]:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update product";

    return NextResponse.json(
      { error: message },
      {
        status:
          message === "Product not found"
            ? 404
            : 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const { id } = await context.params;

    const productId = Number(id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    /*
     * Normal delete = deactivate.
     * The product remains in the database.
     */
    const product =
      await deactivateProduct(productId);

    return NextResponse.json({
      message:
        "Product deactivated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/products/[id]:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete product";

    return NextResponse.json(
      { error: message },
      {
        status:
          message === "Product not found"
            ? 404
            : 500,
      }
    );
  }
}