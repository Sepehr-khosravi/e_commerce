import { prisma } from "../prisma";

import type {
  CategorySearchOptions,
  CreateCategoryData,
  UpdateCategoryData,
} from "./category.types";

export async function findCategoryById(id: number) {
  return prisma.category.findUnique({
    where: {
      id,
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: {
      slug,
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function findCategories(
  options: CategorySearchOptions = {}
) {
  const {
    query,
    cursor,
    limit = 20,
  } = options;

  const categories = await prisma.category.findMany({
    where: query
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          },
        }
      : undefined,

    take: limit + 1,

    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }
      : {}),

    orderBy: {
      id: "asc",
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const hasNextPage = categories.length > limit;

  if (hasNextPage) {
    categories.pop();
  }

  const nextCursor =
    hasNextPage && categories.length > 0
      ? categories[categories.length - 1].id
      : null;

  return {
    categories,
    nextCursor,
    hasNextPage,
  };
}

export async function findCategoryProducts(
  categoryId: number,
  cursor?: number,
  limit = 20
) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
    },

    take: limit + 1,

    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }
      : {}),

    orderBy: {
      id: "desc",
    },

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

export async function createCategory(
  data: CreateCategoryData
) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
    },
  });
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryData
) {
  return prisma.category.update({
    where: {
      id,
    },

    data,
  });
}

export async function deleteCategory(id: number) {
  return prisma.category.delete({
    where: {
      id,
    },
  });
}