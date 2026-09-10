import { prisma } from "../prisma";

const PAGE_SIZE = 100;

export class TorobRepository {
  // =========================
  // NORMAL PAGINATION
  // =========================

  async getProductsByPage(page: number) {
    const skip = (page - 1) * PAGE_SIZE;

    return prisma.product.findMany({
      where: {
        isActive: true,
      },

      include: {
        category: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,

      take: PAGE_SIZE,
    });
  }

  // =========================
  // UPDATED PAGINATION
  // =========================

  async getProductsByUpdatedPage(page: number) {
    const skip = (page - 1) * PAGE_SIZE;

    return prisma.product.findMany({
      where: {
        isActive: true,
      },

      include: {
        category: true,
      },

      orderBy: {
        updatedAt: "desc",
      },

      skip,

      take: PAGE_SIZE,
    });
  }

  // =========================
  // COUNT
  // =========================

  async countProducts() {
    return prisma.product.count({
      where: {
        isActive: true,
      },
    });
  }

  // =========================
  // BY IDS / PAGE UNIQUES
  // =========================

  async getProductsByIds(ids: number[]) {
    return prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },

        isActive: true,
      },

      include: {
        category: true,
      },
    });
  }

  // =========================
  // BY SLUGS
  // =========================

  async getProductsBySlugs(slugs: string[]) {
    return prisma.product.findMany({
      where: {
        slug: {
          in: slugs,
        },

        isActive: true,
      },

      include: {
        category: true,
      },
    });
  }

  // =========================
  // CURSOR PAGINATION
  // =========================

  async getProductsByCursor(cursor?: string) {
    const cursorId = cursor ? Number(cursor) : undefined;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },

      include: {
        category: true,
      },

      orderBy: {
        id: "desc",
      },

      ...(Number.isInteger(cursorId)
        ? {
            cursor: {
              id: cursorId,
            },

            skip: 1,
          }
        : {}),

      take: PAGE_SIZE + 1,
    });

    const hasMore = products.length > PAGE_SIZE;

    const resultProducts = hasMore
      ? products.slice(0, PAGE_SIZE)
      : products;

    const lastProduct = resultProducts.at(-1);

    return {
      products: resultProducts,

      nextCursor:
        hasMore && lastProduct
          ? String(lastProduct.id)
          : null,
    };
  }
}
