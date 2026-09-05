import { prisma } from "../prisma";

import type {
  AddToCartData,
  UpdateCartItemData,
} from "./cart.types";

export async function findUserCart(
  userId: number,
  options?: {
    cursor?: number;
    limit?: number;
  }
) {
  const limit = options?.limit ?? 20;
  const cursor = options?.cursor;

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },

    select: {
      id: true,

      items: {
        where: {
          product: {
            isActive: true,
          },
        },

        orderBy: {
          id: "asc",
        },

        take: limit + 1,

        ...(cursor
          ? {
              skip: 1,
              cursor: {
                id: cursor,
              },
            }
          : {}),

        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return null;
  }

  const hasMore = cart.items.length > limit;

  const items = hasMore
    ? cart.items.slice(0, limit)
    : cart.items;

  const nextCursor =
    hasMore && items.length > 0
      ? items[items.length - 1].id
      : null;

  const totalItems = await prisma.cartItem.count({
    where: {
      cartId: cart.id,

      product: {
        isActive: true,
      },
    },
  });

  return {
    id: cart.id,
    items,
    totalItems,
    nextCursor,
    hasMore,
  };
}

export async function createUserCart(
  userId: number
) {
  return prisma.cart.create({
    data: {
      userId,
    },

    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });
}

export async function findCartItem(
  userId: number,
  itemId: number
) {
  return prisma.cartItem.findFirst({
    where: {
      id: itemId,

      cart: {
        userId,
      },
    },

    include: {
      product: true,
      cart: true,
    },
  });
}

export async function findCartItemByProduct(
  userId: number,
  productId: number
) {
  return prisma.cartItem.findFirst({
    where: {
      productId,

      cart: {
        userId,
      },
    },

    include: {
      product: true,
      cart: true,
    },
  });
}

export async function createCartItem(
  data: AddToCartData,
  cartId: number
) {
  return prisma.cartItem.create({
    data: {
      cartId,
      productId: data.productId,
      quantity: data.quantity,
    },

    include: {
      product: true,
    },
  });
}

export async function updateCartItemQuantity(
  data: UpdateCartItemData
) {
  return prisma.cartItem.update({
    where: {
      id: data.itemId,
    },

    data: {
      quantity: data.quantity,
    },

    include: {
      product: true,
    },
  });
}

export async function deleteCartItem(
  itemId: number
) {
  return prisma.cartItem.delete({
    where: {
      id: itemId,
    },
  });
}

export async function clearUserCart(
  userId: number
) {
  return prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId,
      },
    },
  });
}

export async function countUserCartItems(
  userId: number
) {
  return prisma.cartItem.count({
    where: {
      cart: {
        userId,
      },
    },
  });
}

export async function findProductForCart(productId: number) {
  return prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      count: true,
      isActive: true,
    },
  });
}