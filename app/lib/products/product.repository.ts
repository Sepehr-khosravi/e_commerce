import { prisma } from "../prisma";

import type {
  CreateProductData,
  SearchProductsOptions,
  UpdateProductData,
} from "./product.types";

type CursorData = {
  id: number;
  value?: string;
};

function encodeCursor(data: CursorData): string {
  return Buffer.from(
    JSON.stringify(data),
    "utf-8"
  ).toString("base64url");
}

function decodeCursor(
  cursor: string
): CursorData | null {
  try {
    const decoded = Buffer.from(
      cursor,
      "base64url"
    ).toString("utf-8");

    const data = JSON.parse(decoded);

    if (
      !data ||
      typeof data.id !== "number" ||
      !Number.isInteger(data.id) ||
      data.id <= 0
    ) {
      return null;
    }

    return {
      id: data.id,
      value:
        typeof data.value === "string"
          ? data.value
          : undefined,
    };
  } catch {
    return null;
  }
}

export async function findAdminProducts(options: {
  query?: string;
  categoryId?: number;
  cursor?: string;
  limit?: number;
  sort?: "newest" | "oldest";
}) {
  const {
    query,
    categoryId,
    cursor,
    limit = 10,
    sort = "newest",
  } = options;

  const where: any = {
    ...(query
      ? {
          title: {
            contains: query,
            mode: "insensitive" as const,
          },
        }
      : {}),

    ...(categoryId !== undefined
      ? {
          categoryId,
        }
      : {}),
  };

  const decodedCursor = cursor
    ? decodeCursor(cursor)
    : null;

  if (cursor && !decodedCursor) {
    throw new Error("Invalid cursor");
  }

  if (decodedCursor) {
    if (sort === "newest") {
      where.OR = [
        {
          createdAt: {
            lt: new Date(decodedCursor.value!),
          },
        },
        {
          AND: [
            {
              createdAt: new Date(
                decodedCursor.value!
              ),
            },
            {
              id: {
                lt: decodedCursor.id,
              },
            },
          ],
        },
      ];
    } else {
      where.OR = [
        {
          createdAt: {
            gt: new Date(decodedCursor.value!),
          },
        },
        {
          AND: [
            {
              createdAt: new Date(
                decodedCursor.value!
              ),
            },
            {
              id: {
                gt: decodedCursor.id,
              },
            },
          ],
        },
      ];
    }
  }

  const orderBy =
    sort === "oldest"
      ? [
          {
            createdAt: "asc" as const,
          },
          {
            id: "asc" as const,
          },
        ]
      : [
          {
            createdAt: "desc" as const,
          },
          {
            id: "desc" as const,
          },
        ];

  const products = await prisma.product.findMany({
    where,
    take: limit + 1,
    orderBy,
    include: {
      category: true,
    },
  });

  const hasNextPage =
    products.length > limit;

  if (hasNextPage) {
    products.pop();
  }

  let nextCursor: string | null = null;

  if (
    hasNextPage &&
    products.length > 0
  ) {
    const last =
      products[products.length - 1];

    nextCursor = encodeCursor({
      id: last.id,
      value: last.createdAt.toISOString(),
    });
  }

  return {
    products,
    nextCursor,
    hasNextPage,
  };
}

export async function findProductById(id: number) {
  return prisma.product.findUnique({
    where: {
      id,
    },

    include: {
      category: true,
    },
  });
}

export async function findProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: {
      slug,
    },

    include: {
      category: true,
    },
  });
}

export async function findProducts(
  options: SearchProductsOptions
) {
  const {
    query,
    categoryId,
    minPrice,
    maxPrice,
    sort = "newest",
    cursor,
    limit = 20,
  } = options;

  const where: any = {
    isActive: true,

    ...(query
      ? {
          title: {
            contains: query,
            mode: "insensitive" as const,
          },
        }
      : {}),

    ...(categoryId
      ? {
          categoryId,
        }
      : {}),

    ...(minPrice !== undefined ||
    maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined
              ? {
                  gte: minPrice,
                }
              : {}),

            ...(maxPrice !== undefined
              ? {
                  lte: maxPrice,
                }
              : {}),
          },
        }
      : {}),
  };

  const decodedCursor = cursor
    ? decodeCursor(cursor)
    : null;

  if (cursor && !decodedCursor) {
    throw new Error("Invalid cursor");
  }

  /*
   * Every sort uses TWO fields:
   *
   * 1. The actual sorting field.
   * 2. id as a stable tie-breaker.
   *
   * This prevents products with equal prices,
   * equal purchase counts, etc. from being skipped.
   */

  switch (sort) {
    case "oldest": {
      if (decodedCursor) {
        const cursorId = decodedCursor.id;

        where.OR = [
          {
            id: {
              gt: cursorId,
            },
          },
        ];
      }

      break;
    }

    case "newest": {
      if (decodedCursor) {
        const cursorId = decodedCursor.id;

        where.OR = [
          {
            id: {
              lt: cursorId,
            },
          },
        ];
      }

      break;
    }

    case "price_asc": {
      if (decodedCursor) {
        const cursorId = decodedCursor.id;
        const cursorValue = decodedCursor.value;

        if (cursorValue === undefined) {
          throw new Error("Invalid price cursor");
        }

        const cursorPrice = Number(cursorValue);

        if (!Number.isFinite(cursorPrice)) {
          throw new Error("Invalid price cursor");
        }

        where.OR = [
          {
            price: {
              gt: cursorPrice,
            },
          },
          {
            AND: [
              {
                price: cursorPrice,
              },
              {
                id: {
                  gt: cursorId,
                },
              },
            ],
          },
        ];
      }

      break;
    }

    case "price_desc": {
      if (decodedCursor) {
        const cursorId = decodedCursor.id;
        const cursorValue = decodedCursor.value;

        if (cursorValue === undefined) {
          throw new Error("Invalid price cursor");
        }

        const cursorPrice = Number(cursorValue);

        if (!Number.isFinite(cursorPrice)) {
          throw new Error("Invalid price cursor");
        }

        where.OR = [
          {
            price: {
              lt: cursorPrice,
            },
          },
          {
            AND: [
              {
                price: cursorPrice,
              },
              {
                id: {
                  lt: cursorId,
                },
              },
            ],
          },
        ];
      }

      break;
    }

    case "popular": {
      if (decodedCursor) {
        const cursorId = decodedCursor.id;
        const cursorValue = decodedCursor.value;

        if (cursorValue === undefined) {
          throw new Error(
            "Invalid popularity cursor"
          );
        }

        const cursorPurchaseCount = Number(
          cursorValue
        );

        if (!Number.isFinite(cursorPurchaseCount)) {
          throw new Error(
            "Invalid popularity cursor"
          );
        }

        where.OR = [
          {
            purchaseCount: {
              lt: cursorPurchaseCount,
            },
          },
          {
            AND: [
              {
                purchaseCount:
                  cursorPurchaseCount,
              },
              {
                id: {
                  lt: cursorId,
                },
              },
            ],
          },
        ];
      }

      break;
    }

    default:
      break;
  }

  let orderBy: any;

  switch (sort) {
    case "oldest":
      orderBy = [
        {
          id: "asc",
        },
      ];
      break;

    case "price_asc":
      orderBy = [
        {
          price: "asc",
        },
        {
          id: "asc",
        },
      ];
      break;

    case "price_desc":
      orderBy = [
        {
          price: "desc",
        },
        {
          id: "desc",
        },
      ];
      break;

    case "popular":
      orderBy = [
        {
          purchaseCount: "desc",
        },
        {
          id: "desc",
        },
      ];
      break;

    case "newest":
    default:
      orderBy = [
        {
          id: "desc",
        },
      ];
      break;
  }

  const products = await prisma.product.findMany({
    where,

    take: limit + 1,

    orderBy,

    include: {
      category: true,
    },
  });

  const hasNextPage = products.length > limit;

  if (hasNextPage) {
    products.pop();
  }

  let nextCursor: string | null = null;

  if (hasNextPage && products.length > 0) {
    const lastProduct =
      products[products.length - 1];

    switch (sort) {
      case "price_asc":
      case "price_desc":
        nextCursor = encodeCursor({
          id: lastProduct.id,
          value: lastProduct.price.toString(),
        });
        break;

      case "popular":
        nextCursor = encodeCursor({
          id: lastProduct.id,
          value: lastProduct.purchaseCount.toString(),
        });
        break;

      case "newest":
      case "oldest":
      default:
        nextCursor = encodeCursor({
          id: lastProduct.id,
        });
        break;
    }
  }

  return {
    products,
    nextCursor,
    hasNextPage,
  };
}

export async function findPopularProducts(limit: number) {
  return prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      purchaseCount: "desc",
    },
    take: limit,
  });
}

export async function findFeaturedProducts(
  limit: number
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },

    orderBy: {
      updatedAt: "desc",
    },

    take: limit,

    include: {
      category: true,
    },
  });
}

export async function findNewestProducts(
  limit: number
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,

    include: {
      category: true,
    },
  });
}

export async function createProduct(
  data: CreateProductData
) {
  return await prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,

      price: data.price,
      offer: data.offer ?? null,

      images: data.images,

      description: data.description,

      categoryId: data.categoryId,

      count: data.count ?? 0,

      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
    },

    include: {
      category: true,
    },
  });
}

export async function updateProduct(
  id: number,
  data: UpdateProductData
) {
  return prisma.product.update({
    where: {
      id,
    },

    data,

    include: {
      category: true,
    },
  });
}

export async function deleteProduct(id: number) {
  /*
   * We don't actually delete the product.
   *
   * Setting isActive=false keeps the product available
   * for historical order records.
   */
  return prisma.product.update({
    where: {
      id,
    },

    data: {
      isActive: false,
    },
  });
}

export async function permanentlyDeleteProduct(
  id: number
) {
  return prisma.product.delete({
    where: {
      id,
    },
  });
}

export async function setProductFeatured(
  id: number,
  isFeatured: boolean
) {
  return prisma.product.update({
    where: {
      id,
    },

    data: {
      isFeatured,
    },
  });
}

export async function updateProductStock(
  id: number,
  count: number
) {
  return prisma.product.update({
    where: {
      id,
    },

    data: {
      count,
    },
  });
}

export async function incrementPurchaseCount(
  id: number,
  amount = 1
) {
  return prisma.product.update({
    where: {
      id,
    },

    data: {
      purchaseCount: {
        increment: amount,
      },
    },
  });
}