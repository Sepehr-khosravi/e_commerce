import { prisma } from "../prisma";

import type {
  AddToCartData,
  UpdateCartItemData,
} from "./cart.types";

export async function findUserCart(
  userId: number
) {
  return prisma.cart.findUnique({
    where: {
      userId,
    },

    include: {
      items: {
        orderBy: {
          id: "asc",
        },

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