import { prisma } from "../prisma";

import type {
  CreateProductData,
  SearchProductsOptions,
  UpdateProductData,
} from "./product.types";

export async function findAdminProducts() {
  return prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      category: true,
    },
  });
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

  const where = {
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

    ...(minPrice !== undefined || maxPrice !== undefined
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

  let orderBy;

  switch (sort) {
    case "oldest":
      orderBy = {
        id: "asc" as const,
      };
      break;

    case "price_asc":
      orderBy = {
        price: "asc" as const,
      };
      break;

    case "price_desc":
      orderBy = {
        price: "desc" as const,
      };
      break;

    case "popular":
      orderBy = {
        purchaseCount: "desc" as const,
      };
      break;

    case "newest":
    default:
      orderBy = {
        id: "desc" as const,
      };
      break;
  }

  const products = await prisma.product.findMany({
    where,

    take: limit + 1,

    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },

          skip: 1,
        }
      : {}),

    orderBy,

    include: {
      category: true,
    },
  });

  const hasNextPage = products.length > limit;

  if (hasNextPage) {
    products.pop();
  }

  const nextCursor =
    hasNextPage && products.length > 0
      ? products[products.length - 1].id
      : null;

  return {
    products,
    nextCursor,
    hasNextPage,
  };
}

export async function findPopularProducts(
  limit: number
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      purchaseCount: "desc",
    },

    take: limit,

    include: {
      category: true,
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