import { prisma } from "../prisma";

import type {
  FavoriteProductInput,
  GetFavoritesOptions,
} from "./favorite.types";

export async function findFavorite(
  userId: number,
  productId: number
) {
  return prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },

    include: {
      product: true,
    },
  });
}

export async function createFavorite(
  data: FavoriteProductInput
) {
  return prisma.favorite.create({
    data: {
      userId: data.userId,
      productId: data.productId,
    },

    include: {
      product: true,
    },
  });
}

export async function deleteFavorite(
  userId: number,
  productId: number
) {
  return prisma.favorite.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
}

export async function findUserFavorites(
  userId: number,
  options: GetFavoritesOptions = {}
) {
  const {
    cursor,
    limit = 20,
  } = options;

  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      product: {
        isActive: true,
      },
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
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  const hasNextPage = favorites.length > limit;

  if (hasNextPage) {
    favorites.pop();
  }

  const nextCursor =
    hasNextPage && favorites.length > 0
      ? favorites[favorites.length - 1].id
      : null;

  return {
    favorites,
    nextCursor,
    hasNextPage,
  };
}

export async function deleteAllUserFavorites(
  userId: number
) {
  return prisma.favorite.deleteMany({
    where: {
      userId,
    },
  });
}