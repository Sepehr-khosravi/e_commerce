import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  deactivateProduct,
  editProduct,
  getProductById,
} from "@/app/lib/products/product.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface ProductVariantInput {
  id?: number;
  color?: string | null;
  count: number;
}

function isValidHexColor(
  color: string
): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
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
      variants?: ProductVariantInput[];
      isFeatured?: boolean;
      isActive?: boolean;
    } = {};

    // =========================================================
    // TITLE
    // =========================================================

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

    // =========================================================
    // SLUG
    // =========================================================

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

    // =========================================================
    // PRICE
    // =========================================================

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

    // =========================================================
    // OFFER
    // =========================================================

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

    // =========================================================
    // IMAGES
    // =========================================================

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

    // =========================================================
    // DESCRIPTION
    // =========================================================

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

    // =========================================================
    // CATEGORY
    // =========================================================

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

    // =========================================================
    // VARIANTS / COLORS
    // =========================================================

    if (body.variants !== undefined) {
      if (!Array.isArray(body.variants)) {
        return NextResponse.json(
          {
            error:
              "Variants must be an array",
          },
          { status: 400 }
        );
      }

      if (body.variants.length === 0) {
        return NextResponse.json(
          {
            error:
              "Product must have at least one variant",
          },
          { status: 400 }
        );
      }

      const variants: ProductVariantInput[] =
        [];

      const colors = new Set<string>();

      let hasColorlessVariant = false;
      let hasColoredVariant = false;

      for (
        const variant of body.variants
      ) {
        if (
          typeof variant !== "object" ||
          variant === null
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid product variant",
            },
            { status: 400 }
          );
        }

        // -----------------------------------------------------
        // Variant ID
        // -----------------------------------------------------

        let variantId:
          | number
          | undefined;

        if (
          variant.id !== undefined
        ) {
          const parsedId = Number(
            variant.id
          );

          if (
            !Number.isInteger(parsedId) ||
            parsedId <= 0
          ) {
            return NextResponse.json(
              {
                error:
                  "Invalid variant ID",
              },
              { status: 400 }
            );
          }

          variantId = parsedId;
        }

        // -----------------------------------------------------
        // Stock
        // -----------------------------------------------------

        const count = Number(
          variant.count
        );

        if (
          !Number.isInteger(count) ||
          count < 0
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid variant count",
            },
            { status: 400 }
          );
        }

        // -----------------------------------------------------
        // Color
        // -----------------------------------------------------

        let color:
          | string
          | null = null;

        if (
          variant.color === null ||
          variant.color === undefined ||
          variant.color === ""
        ) {
          hasColorlessVariant = true;
        } else {
          if (
            typeof variant.color !==
            "string"
          ) {
            return NextResponse.json(
              {
                error:
                  "Invalid variant color",
              },
              { status: 400 }
            );
          }

          const normalizedColor =
            variant.color
              .trim()
              .toUpperCase();

          if (
            !isValidHexColor(
              normalizedColor
            )
          ) {
            return NextResponse.json(
              {
                error:
                  "Invalid variant color. Color must be a valid HEX value.",
              },
              { status: 400 }
            );
          }

          if (
            colors.has(normalizedColor)
          ) {
            return NextResponse.json(
              {
                error:
                  "Duplicate variant colors are not allowed",
              },
              { status: 400 }
            );
          }

          colors.add(normalizedColor);

          color = normalizedColor;

          hasColoredVariant = true;
        }

        variants.push({
          ...(variantId !== undefined
            ? { id: variantId }
            : {}),
          color,
          count,
        });
      }

      // -------------------------------------------------------
      // Do not allow mixing colorless + colored variants
      // -------------------------------------------------------

      if (
        hasColorlessVariant &&
        hasColoredVariant
      ) {
        return NextResponse.json(
          {
            error:
              "A product cannot have both colored and colorless variants",
          },
          { status: 400 }
        );
      }

      // Only one colorless variant is allowed
      if (
        hasColorlessVariant &&
        variants.length !== 1
      ) {
        return NextResponse.json(
          {
            error:
              "A colorless product can only have one variant",
          },
          { status: 400 }
        );
      }

      data.variants = variants;
    }

    // =========================================================
    // FEATURED
    // =========================================================

    if (body.isFeatured !== undefined) {
      if (
        typeof body.isFeatured !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid isFeatured",
          },
          { status: 400 }
        );
      }

      data.isFeatured =
        body.isFeatured;
    }

    // =========================================================
    // ACTIVE
    // =========================================================

    if (body.isActive !== undefined) {
      if (
        typeof body.isActive !==
        "boolean"
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

    // =========================================================
    // UPDATE
    // =========================================================

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