import { prisma } from "../prisma";

import {
  ZarinPalProvider,
} from "./zarinpal.provider";

const provider = new ZarinPalProvider();

function getCallbackUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured"
    );
  }

  return `${appUrl.replace(/\/$/, "")}/payment/callback`;
}

/**
 * Create or reuse a pending payment for an order.
 */
export async function requestPaymentForUser(
  userId: number,
  orderId: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("Invalid order ID");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      payments: {
        where: {
          status: "PENDING",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus === "PAID") {
    throw new Error("Order is already paid");
  }

  if (order.status !== "PENDING") {
    throw new Error(
      "Order is not available for payment"
    );
  }

  const amount = Number(order.totalPrice);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid order amount");
  }

  /*
   * If we already have a pending payment,
   * reuse it instead of creating another authority.
   */
  const existingPayment = order.payments[0];

  if (existingPayment) {
    return {
      authority: existingPayment.authority,
      paymentUrl:
        `${getZarinPalBaseUrl()}/pg/StartPay/${existingPayment.authority}`,
    };
  }

  const callbackUrl = getCallbackUrl();

  const payment = await provider.requestPayment({
    amount,
    callbackUrl,
    description: `Order #${order.id}`,
  });

  /*
   * Protect against a race where another request
   * created a payment between our SELECT and CREATE.
   */
  const createdPayment = await prisma.payment.create({
    data: {
      orderId: order.id,
      amount,
      authority: payment.authority,
      status: "PENDING",
    },
  });

  return {
    authority: createdPayment.authority,
    paymentUrl: payment.paymentUrl,
  };
}

/**
 * Helper used only for building the existing
 * ZarinPal StartPay URL.
 */
function getZarinPalBaseUrl() {
  return (
    process.env.ZARINPAL_BASE_URL ||
    "https://sandbox.zarinpal.com"
  ).replace(/\/$/, "");
}

/**
 * Verify a payment using the provider.
 *
 * This function is idempotent:
 * calling it multiple times after success
 * will NOT increase stock/purchaseCount again.
 */
export async function verifyPayment(
  authority: string
) {
  if (
    typeof authority !== "string" ||
    !authority.trim()
  ) {
    throw new Error("Invalid payment authority");
  }

  const payment = await prisma.payment.findUnique({
    where: {
      authority: authority.trim(),
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  /*
   * Already processed.
   */
  if (payment.status === "PAID") {
    return {
      success: true,
      referenceId: payment.transactionId,
      alreadyVerified: true,
    };
  }

  const order = payment.order;

  /*
   * The order may already have been paid by another
   * verification request.
   */
  if (order.paymentStatus === "PAID") {
    return {
      success: true,
      referenceId: payment.transactionId,
      alreadyVerified: true,
    };
  }

  if (order.status !== "PENDING") {
    throw new Error(
      "Order is no longer available for payment"
    );
  }

  if (payment.status !== "PENDING") {
    return {
      success: false,
      message: "Payment is no longer pending",
    };
  }

  const amount = Number(payment.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid payment amount");
  }

  /*
   * IMPORTANT:
   * Provider verification happens before changing
   * our database to PAID.
   */
  const verification =
    await provider.verifyPayment({
      authority: payment.authority,
      amount,
    });

  /*
   * PAYMENT FAILED
   */
  if (!verification.success) {
    const result = await prisma.$transaction(
      async (tx) => {
        /*
         * Only the payment that is still PENDING
         * can perform the failure transition.
         */
        const paymentUpdate =
          await tx.payment.updateMany({
            where: {
              id: payment.id,
              status: "PENDING",
            },
            data: {
              status: "FAILED",
            },
          });

        /*
         * Another request already processed this payment.
         */
        if (paymentUpdate.count !== 1) {
          return {
            alreadyProcessed: true,
          };
        }

        const currentOrder =
          await tx.order.findUnique({
            where: {
              id: order.id,
            },
            include: {
              items: true,
            },
          });

        if (!currentOrder) {
          throw new Error("Order not found");
        }

        /*
         * If the order was already cancelled,
         * stock has already been restored.
         */
        if (
          currentOrder.status === "CANCELLED"
        ) {
          return {
            alreadyProcessed: false,
          };
        }

        /*
         * Restore the stock reserved when the
         * order was created.
         */
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              count: {
                increment: item.quantity,
              },
            },
          });
        }

        await tx.order.update({
          where: {
            id: currentOrder.id,
          },
          data: {
            status: "CANCELLED",
            paymentStatus: "FAILED",
          },
        });

        return {
          alreadyProcessed: false,
        };
      }
    );

    return {
      success: false,
      message:
        verification.message ||
        "Payment failed",
      alreadyProcessed:
        result.alreadyProcessed,
    };
  }

  /*
   * PAYMENT SUCCESS
   */
  const result = await prisma.$transaction(
    async (tx) => {
      /*
       * Only a PENDING payment can transition
       * to PAID.
       *
       * This prevents duplicate callbacks from
       * incrementing purchaseCount twice.
       */
      const paymentUpdate =
        await tx.payment.updateMany({
          where: {
            id: payment.id,
            status: "PENDING",
          },
          data: {
            status: "PAID",
            transactionId:
              verification.referenceId,
            paidAt: new Date(),
          },
        });

      /*
       * Another request already completed payment.
       */
      if (paymentUpdate.count !== 1) {
        return {
          alreadyPaid: true,
        };
      }

      /*
       * Make sure the order is still pending.
       */
      const currentOrder =
        await tx.order.findUnique({
          where: {
            id: order.id,
          },
          include: {
            items: true,
          },
        });

      if (!currentOrder) {
        throw new Error("Order not found");
      }

      if (
        currentOrder.paymentStatus === "PAID"
      ) {
        return {
          alreadyPaid: true,
        };
      }

      if (
        currentOrder.status !== "PENDING"
      ) {
        throw new Error(
          "Order is no longer pending"
        );
      }

      /*
       * Order is now successfully paid.
       */
      await tx.order.update({
        where: {
          id: currentOrder.id,
        },
        data: {
          paymentStatus: "PAID",
          status: "PROCESSING",
        },
      });

      /*
       * Count the actual sold quantity.
       */
      for (const item of currentOrder.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            purchaseCount: {
              increment: item.quantity,
            },
          },
        });
      }

      /*
       * IMPORTANT:
       * Remove only products that belonged to
       * this order.
       *
       * We do NOT clear the entire cart anymore.
       */
      for (const item of currentOrder.items) {
        const cart = await tx.cart.findUnique({
          where: {
            userId: currentOrder.userId,
          },
        });

        if (!cart) {
          break;
        }

        const cartItem =
          await tx.cartItem.findUnique({
            where: {
              cartId_productId: {
                cartId: cart.id,
                productId: item.productId,
              },
            },
          });

        if (!cartItem) {
          continue;
        }

        if (
          cartItem.quantity <= item.quantity
        ) {
          await tx.cartItem.delete({
            where: {
              id: cartItem.id,
            },
          });
        } else {
          await tx.cartItem.update({
            where: {
              id: cartItem.id,
            },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return {
        alreadyPaid: false,
      };
    }
  );

  return {
    success: true,
    referenceId:
      verification.referenceId,
    alreadyVerified:
      result.alreadyPaid,
  };
}