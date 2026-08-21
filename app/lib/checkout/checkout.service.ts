import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../prisma";

import type { CheckoutData } from "./checkout.types";

export async function checkout(
  userId: number,
  data: CheckoutData
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  if (!data.firstName.trim()) {
    throw new Error("First name is required");
  }

  if (!data.lastName.trim()) {
    throw new Error("Last name is required");
  }

  if (!data.phone.trim()) {
    throw new Error("Phone number is required");
  }

  if (!data.address.trim()) {
    throw new Error("Address is required");
  }

  return prisma.$transaction(async (tx) => {
    /*
     * IMPORTANT:
     *
     * The cart should be read inside the transaction.
     * We will connect this to your existing Cart/CartItem
     * schema rather than trusting anything from the client.
     */

    const cart = await tx.cart.findUnique({
      where: {
        userId,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Shopping cart not found");
    }

    if (cart.items.length === 0) {
      throw new Error("Shopping cart is empty");
    }

    let totalPrice = 0;

    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        throw new Error(
          "A product in your cart no longer exists"
        );
      }

      if (!product.isActive) {
        throw new Error(
          `${product.title} is no longer available`
        );
      }

      if (product.count < item.quantity) {
        throw new Error(
          `Not enough stock for ${product.title}`
        );
      }

      /*
       * If offer exists, use the offer price.
       * Otherwise use the normal price.
       */
      const unitPrice: Decimal =
        product.offer !== null
          ? product.offer
          : product.price;

      const subtotal =
        Number(unitPrice) * item.quantity;

      totalPrice += subtotal;

      orderItems.push({
        product: {
          connect: {
            id: product.id,
          },
        },
        productTitle: product.title,
        productPrice: Number(unitPrice),
        quantity: item.quantity,
        subtotal,
      });
    }

    const order = await tx.order.create({
      data: {
        userId,

        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),

        totalPrice,

        items: {
          create: orderItems,
        },
      },

      include: {
        items: true,
      },
    });

    /*
     * Reduce inventory.
     */
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,

          /*
           * Prevent race conditions where another
           * customer buys the remaining stock.
           */
          count: {
            gte: item.quantity,
          },
        },

        data: {
          count: {
            decrement: item.quantity,
          },

          purchaseCount: {
            increment: item.quantity,
          },
        },
      });

      if (updated.count !== 1) {
        throw new Error(
          `Stock changed for ${item.product.title}. Please try again.`
        );
      }
    }

    /*
     * Clear the cart only after the order and
     * inventory updates succeeded.
     */
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  });
}