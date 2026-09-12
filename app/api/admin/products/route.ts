import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  createNewProduct,
  getAdminProducts,
} from "@/app/lib/products/product.service";

// ======================================================
// GET - Admin Products
// ======================================================

export async function GET(
  request: NextRequest
) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const searchParams =
      request.nextUrl.searchParams;

    const query =
      searchParams.get("q") ?? undefined;

    const categoryIdParam =
      searchParams.get("categoryId");

    const cursor =
      searchParams.get("cursor") ?? undefined;

    const limitParam =
      searchParams.get("limit");

    const sortParam =
      searchParams.get("sort");

    const categoryId =
      categoryIdParam
        ? Number(categoryIdParam)
        : undefined;

    const limit =
      limitParam
        ? Number(limitParam)
        : 10;

    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) ||
        categoryId <= 0)
    ) {
      return NextResponse.json(
        {
          error: "Invalid categoryId",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return NextResponse.json(
        {
          error: "Limit must be between 1 and 50",
        },
        { status: 400 }
      );
    }

    const allowedSorts = [
      "newest",
      "oldest",
    ] as const;

    type AdminProductSort =
      (typeof allowedSorts)[number];

    const sort =
      allowedSorts.includes(
        sortParam as AdminProductSort
      )
        ? (sortParam as AdminProductSort)
        : "newest";

    const result =
      await getAdminProducts({
        query,
        categoryId,
        cursor,
        limit,
        sort,
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/admin/products:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get products",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// POST - Create Product
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const body = await request.json();

    const price = Number(body.price);
    const categoryId = Number(body.categoryId);

    const offer: number =
      body.offer === undefined ||
      body.offer === null ||
      body.offer === ""
        ? 0
        : Number(body.offer);

    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------

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
      !Number.isFinite(offer) ||
      offer < 0 ||
      offer > 100
    ) {
      return NextResponse.json(
        {
          error: "Offer must be between 0 and 100",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Variants
    // --------------------------------------------------

    if (!Array.isArray(body.variants) ||
        body.variants.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one product variant is required",
        },
        { status: 400 }
      );
    }

    const variants = body.variants.map(
      (variant: unknown) => {
        if (
          typeof variant !== "object" ||
          variant === null
        ) {
          throw new Error(
            "Invalid product variant"
          );
        }

        const item =
          variant as {
            color?: unknown;
            count?: unknown;
          };

        const count =
          Number(item.count);

        if (
          !Number.isInteger(count) ||
          count < 0
        ) {
          throw new Error(
            "Invalid variant stock count"
          );
        }

        let color:
          | string
          | null = null;

        if (
          item.color !== undefined &&
          item.color !== null &&
          item.color !== ""
        ) {
          if (
            typeof item.color !== "string"
          ) {
            throw new Error(
              "Invalid variant color"
            );
          }

          color = item.color;
        }

        return {
          color,
          count,
        };
      }
    );

    // --------------------------------------------------
    // Other fields
    // --------------------------------------------------

    const images =
      Array.isArray(body.images)
        ? body.images.filter(
            (
              image: unknown
            ): image is string =>
              typeof image === "string"
          )
        : [];

    const description =
      typeof body.description === "string"
        ? body.description
        : "";

    // --------------------------------------------------
    // Create
    // --------------------------------------------------

    const product =
      await createNewProduct({
        title: body.title.trim(),
        slug: body.slug.trim(),
        price,
        offer,
        images,
        description,
        categoryId,
        variants,

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