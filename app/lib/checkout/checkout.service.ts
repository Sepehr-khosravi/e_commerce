import { prisma } from "../prisma";

import type { CheckoutData } from "./checkout.types";

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function checkout(
  userId: number,
  data: CheckoutData
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const phone = data.phone.trim();
  const address = data.address.trim();

  if (!firstName) {
    throw new Error("First name is required");
  }

  if (!lastName) {
    throw new Error("Last name is required");
  }

  if (!phone) {
    throw new Error("Phone number is required");
  }

  if (!address) {
    throw new Error("Address is required");
  }

  return prisma.$transaction(async (tx) => {
    /*
     * Always read the cart from the database.
     * Never trust product prices, offers or quantities
     * coming from the client.
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

    const orderItems: Array<{
      product: {
        connect: {
          id: number;
        };
      };
      productTitle: string;
      productPrice: number;
      productOffer: number;
      quantity: number;
      totalPrice: number;
    }> = [];

    /*
     * Calculate the order using the current database
     * price and offer.
     */
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

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error(
          `Invalid quantity for ${product.title}`
        );
      }

      if (product.count < item.quantity) {
        throw new Error(
          `Not enough stock for ${product.title}`
        );
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(
          `Invalid price for ${product.title}`
        );
      }

      /*
       * In your schema, "offer" is a percentage.
       *
       * Example:
       * price = 10,000,000
       * offer = 20
       *
       * final price = 8,000,000
       */
      const offer =
        product.offer === null
          ? 0
          : Number(product.offer);

      if (
        !Number.isFinite(offer) ||
        offer < 0 ||
        offer > 100
      ) {
        throw new Error(
          `Invalid offer for ${product.title}`
        );
      }

      const finalUnitPrice = roundMoney(
        price * (1 - offer / 100)
      );

      const subtotal = roundMoney(
        finalUnitPrice * item.quantity
      );

      totalPrice = roundMoney(
        totalPrice + subtotal
      );

      orderItems.push({
        product: {
          connect: {
            id: product.id,
          },
        },

        productTitle: product.title,

        /*
         * Store the ORIGINAL price in OrderItem.
         * This is useful for displaying the discount later.
         */
        productPrice: price,

        /*
         * Store the percentage discount separately.
         */
        productOffer: offer,

        quantity: item.quantity,

        /*
         * Store the final price for this item.
         */
        totalPrice: subtotal,
      });
    }

    /*
     * Reserve/decrement stock atomically.
     *
     * IMPORTANT:
     * purchaseCount is NOT incremented here.
     *
     * It should only increase after successful payment.
     */
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          isActive: true,

          count: {
            gte: item.quantity,
          },
        },

        data: {
          count: {
            decrement: item.quantity,
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
     * Create the order AFTER validating and reserving
     * the required stock.
     */
    const order = await tx.order.create({
      data: {
        userId,

        firstName,
        lastName,
        phone,
        address,

        totalPrice,

        status: "PENDING",
        paymentStatus: "PENDING",

        items: {
          create: orderItems,
        },
      },

      include: {
        items: true,
      },
    });

    /*
     * Clear the cart only after the order has been
     * successfully created.
     */
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  });
}