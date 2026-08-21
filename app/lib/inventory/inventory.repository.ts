import { prisma } from "../prisma";

export async function getLowStockProducts(
  threshold: number
) {
  return prisma.product.findMany({
    where: {
      isActive: true,

      count: {
        lte: threshold,
      },
    },

    orderBy: {
      count: "asc",
    },

    include: {
      category: true,
    },
  });
}

export async function getOutOfStockProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,

      count: {
        lte: 0,
      },
    },

    orderBy: {
      updatedAt: "desc",
    },

    include: {
      category: true,
    },
  });
}

export async function setProductStock(
  productId: number,
  count: number
) {
  return prisma.product.update({
    where: {
      id: productId,
    },

    data: {
      count,
    },
  });
}