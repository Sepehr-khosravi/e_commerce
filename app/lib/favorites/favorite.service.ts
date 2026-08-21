import {
  createFavorite,
  deleteAllUserFavorites,
  deleteFavorite,
  findFavorite,
  findUserFavorites,
} from "./favorite.repository";

import type {
  GetFavoritesOptions,
} from "./favorite.types";

export async function isProductFavorite(
  userId: number,
  productId: number
) {
  const favorite = await findFavorite(
    userId,
    productId
  );

  return favorite !== null;
}

export async function addProductToFavorites(
  userId: number,
  productId: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error("Invalid product ID");
  }

  const existingFavorite = await findFavorite(
    userId,
    productId
  );

  if (existingFavorite) {
    return existingFavorite;
  }

  return createFavorite({
    userId,
    productId,
  });
}

export async function removeProductFromFavorites(
  userId: number,
  productId: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error("Invalid product ID");
  }

  const existingFavorite = await findFavorite(
    userId,
    productId
  );

  if (!existingFavorite) {
    return null;
  }

  return deleteFavorite(userId, productId);
}

export async function getUserFavorites(
  userId: number,
  options: GetFavoritesOptions = {}
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const limit = Math.min(
    Math.max(options.limit ?? 20, 1),
    100
  );

  return findUserFavorites(userId, {
    ...options,
    limit,
  });
}

export async function clearUserFavorites(
  userId: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  return deleteAllUserFavorites(userId);
}