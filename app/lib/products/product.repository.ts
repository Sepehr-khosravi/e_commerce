import { prisma } from "../prisma";

import type {
  CreateProductData,
  ProductPagination,
  ProductSort,
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

/* =========================================================
   ADMIN PRODUCTS
   ========================================================= */

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
    const cursorDate = new Date(
      decodedCursor.value!
    );

    if (sort === "newest") {
      where.OR = [
        {
          createdAt: {
            lt: cursorDate,
          },
        },
        {
          AND: [
            {
              createdAt: cursorDate,
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
            gt: cursorDate,
          },
        },
        {
          AND: [
            {
              createdAt: cursorDate,
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
      variants: true,
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

/* =========================================================
   SINGLE PRODUCT
   ========================================================= */

export async function findProductById(
  id: number
) {
  return prisma.product.findUnique({
    where: {
      id,
    },

    include: {
      category: true,
      variants: true,
    },
  });
}

export async function findProductBySlug(
  slug: string
) {
  return prisma.product.findUnique({
    where: {
      slug,
    },

    include: {
      category: true,
      variants: true,
    },
  });
}

/* =========================================================
   PUBLIC PRODUCTS
   ========================================================= */

export async function findProducts(
  options: SearchProductsOptions
): Promise<ProductPagination> {
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

    ...(categoryId !== undefined
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
   * Cursor pagination always uses:
   *
   * sorting field + id
   *
   * id is the stable tie-breaker.
   */

  switch (sort) {
    case "oldest": {
      if (decodedCursor) {
        where.OR = [
          {
            id: {
              gt: decodedCursor.id,
            },
          },
        ];
      }

      break;
    }

    case "newest": {
      if (decodedCursor) {
        where.OR = [
          {
            id: {
              lt: decodedCursor.id,
            },
          },
        ];
      }

      break;
    }

    case "price_asc": {
      if (decodedCursor) {
        if (
          decodedCursor.value ===
          undefined
        ) {
          throw new Error(
            "Invalid price cursor"
          );
        }

        const cursorPrice = Number(
          decodedCursor.value
        );

        if (!Number.isFinite(cursorPrice)) {
          throw new Error(
            "Invalid price cursor"
          );
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
                  gt: decodedCursor.id,
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
        if (
          decodedCursor.value ===
          undefined
        ) {
          throw new Error(
            "Invalid price cursor"
          );
        }

        const cursorPrice = Number(
          decodedCursor.value
        );

        if (!Number.isFinite(cursorPrice)) {
          throw new Error(
            "Invalid price cursor"
          );
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
                  lt: decodedCursor.id,
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
        if (
          decodedCursor.value ===
          undefined
        ) {
          throw new Error(
            "Invalid popularity cursor"
          );
        }

        const cursorPurchaseCount =
          Number(decodedCursor.value);

        if (
          !Number.isFinite(
            cursorPurchaseCount
          )
        ) {
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
                  lt: decodedCursor.id,
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

  const products =
    await prisma.product.findMany({
      where,

      take: limit + 1,

      orderBy,

      include: {
        category: true,
        variants: true,
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
    const lastProduct =
      products[products.length - 1];

    switch (sort) {
      case "price_asc":
      case "price_desc":
        nextCursor = encodeCursor({
          id: lastProduct.id,
          value:
            lastProduct.price.toString(),
        });
        break;

      case "popular":
        nextCursor = encodeCursor({
          id: lastProduct.id,
          value:
            lastProduct.purchaseCount.toString(),
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

/* =========================================================
   SPECIAL PRODUCT QUERIES
   ========================================================= */

export async function findPopularProducts(
  limit: number
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
    },

    orderBy: [
      {
        purchaseCount: "desc",
      },
      {
        id: "desc",
      },
    ],

    take: limit,

    include: {
      category: true,
      variants: true,
    },
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
      variants: true,
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

    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],

    take: limit,

    include: {
      category: true,
      variants: true,
    },
  });
}

/* =========================================================
   CREATE PRODUCT
   ========================================================= */

export async function createProduct(
  data: CreateProductData
) {
  return prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,

      price: data.price,
      offer: data.offer ?? null,

      images: data.images,

      description: data.description,

      categoryId: data.categoryId,

      isFeatured:
        data.isFeatured ?? false,

      isActive:
        data.isActive ?? true,

      variants: {
        create: data.variants.map(
          (variant) => ({
            color:
              variant.color ?? null,

            count: variant.count,
          })
        ),
      },
    },

    include: {
      category: true,
      variants: true,
    },
  });
}

/* =========================================================
   UPDATE PRODUCT
   ========================================================= */

export async function updateProduct(
  id: number,
  data: UpdateProductData
) {
  return prisma.$transaction(
    async (tx) => {
      /*
       * Product scalar fields.
       *
       * variants are intentionally handled separately
       * because they have their own records.
       */

      const product = await tx.product.update(
        {
          where: {
            id,
          },

          data: {
            ...(data.title !== undefined
              ? {
                  title: data.title,
                }
              : {}),

            ...(data.slug !== undefined
              ? {
                  slug: data.slug,
                }
              : {}),

            ...(data.price !== undefined
              ? {
                  price: data.price,
                }
              : {}),

            ...(data.offer !== undefined
              ? {
                  offer: data.offer,
                }
              : {}),

            ...(data.images !== undefined
              ? {
                  images: data.images,
                }
              : {}),

            ...(data.description !== undefined
              ? {
                  description:
                    data.description,
                }
              : {}),

            ...(data.categoryId !== undefined
              ? {
                  categoryId:
                    data.categoryId,
                }
              : {}),

            ...(data.isFeatured !== undefined
              ? {
                  isFeatured:
                    data.isFeatured,
                }
              : {}),

            ...(data.isActive !== undefined
              ? {
                  isActive:
                    data.isActive,
                }
              : {}),
          },
        }
      );

      /*
       * If variants were not supplied,
       * don't touch the existing variants.
       */

      if (data.variants !== undefined) {
        const existingVariants =
          await tx.productVariant.findMany(
            {
              where: {
                productId: id,
              },

              include: {
                _count: {
                  select: {
                    cartItems: true,
                    orderItems: true,
                  },
                },
              },
            }
          );

        const existingVariantIds =
          new Set(
            existingVariants.map(
              (variant) => variant.id
            )
          );

        const incomingVariantIds =
          new Set<number>();

        /*
         * Update existing variants and
         * create new variants.
         */

        for (const variant of data.variants) {
          if (variant.id !== undefined) {
            /*
             * Prevent modifying another product's variant.
             */
            if (
              !existingVariantIds.has(
                variant.id
              )
            ) {
              throw new Error(
                `Variant ${variant.id} does not belong to product ${id}`
              );
            }

            incomingVariantIds.add(
              variant.id
            );

            await tx.productVariant.update(
              {
                where: {
                  id: variant.id,
                },

                data: {
                  color:
                    variant.color ??
                    null,

                  count: variant.count,
                },
              }
            );
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,

                color:
                  variant.color ??
                  null,

                count: variant.count,
              },
            });
          }
        }

        /*
         * Variants that are no longer present
         * in the new list should be removed.
         *
         * But a variant referenced by a cart/order
         * cannot safely be deleted.
         */

        for (const existingVariant of existingVariants) {
          if (
            incomingVariantIds.has(
              existingVariant.id
            )
          ) {
            continue;
          }

          const isReferenced =
            existingVariant._count
              .cartItems > 0 ||
            existingVariant._count
              .orderItems > 0;

          if (isReferenced) {
            throw new Error(
              `Variant ${existingVariant.id} is already used by a cart or order and cannot be removed`
            );
          }

          await tx.productVariant.delete(
            {
              where: {
                id: existingVariant.id,
              },
            }
          );
        }
      }

      return tx.product.findUniqueOrThrow({
        where: {
          id: product.id,
        },

        include: {
          category: true,
          variants: true,
        },
      });
    }
  );
}

/* =========================================================
   PRODUCT STATUS
   ========================================================= */

export async function deleteProduct(
  id: number
) {
  /*
   * Soft delete.
   *
   * Historical orders still keep their
   * product/variant references.
   */

  return prisma.product.update({
    where: {
      id,
    },

    data: {
      isActive: false,
    },

    include: {
      category: true,
      variants: true,
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

    include: {
      category: true,
      variants: true,
    },
  });
}

/* =========================================================
   VARIANT STOCK
   ========================================================= */

export async function findProductVariantById(
  id: number
) {
  return prisma.productVariant.findUnique({
    where: {
      id,
    },

    include: {
      product: true,
    },
  });
}

export async function updateProductVariantStock(
  variantId: number,
  count: number
) {
  return prisma.productVariant.update({
    where: {
      id: variantId,
    },

    data: {
      count,
    },

    include: {
      product: true,
    },
  });
}

/* =========================================================
   PURCHASE COUNT
   ========================================================= */

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