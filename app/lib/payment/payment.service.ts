import { prisma } from "../prisma";

import {
  ZarinPalProvider,
} from "./zarinpal.provider";

import {
  findOrderByUser,
} from "../orders/order.repository";

import {
  createPayment,
  findPendingPaymentByOrder,
} from "./payment.repository";

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

function getZarinPalBaseUrl() {
  return (
    process.env.ZARINPAL_BASE_URL ||
    "https://sandbox.zarinpal.com"
  ).replace(/\/$/, "");
}

/**
 * Create a NEW payment attempt for an order.
 *
 * IMPORTANT:
 * We intentionally DO NOT reuse an old PENDING
 * ZarinPal authority.
 *
 * A previous authority may have expired.
 */
export async function requestPaymentForUser(
  userId: number,
  orderId: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user");
  }

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("Invalid order ID");
  }

  /*
   * SECURITY:
   *
   * The order is searched using BOTH:
   *
   * order.id
   * order.userId
   *
   * Therefore the user cannot pay another
   * user's order by changing the URL.
   */
  const order = await findOrderByUser(
    orderId,
    userId
  );

  if (!order) {
    throw new Error("Order not found");
  }

  /*
   * A cancelled order has already released
   * its reserved stock.
   *
   * It cannot be paid again.
   */
  if (order.status === "CANCELLED") {
    throw new Error(
      "این سفارش لغو شده و دیگر قابل پرداخت نیست."
    );
  }

  if (order.status === "REFUNDED") {
    throw new Error(
      "این سفارش بازپرداخت شده و دیگر قابل پرداخت نیست."
    );
  }

  /*
   * Never create another payment for an
   * already-paid order.
   */
  if (order.paymentStatus === "PAID") {
    throw new Error(
      "این سفارش قبلاً پرداخت شده است."
    );
  }

  /*
   * Only PENDING orders can start payment.
   */
  if (order.status !== "PENDING") {
    throw new Error(
      "این سفارش در وضعیت قابل پرداخت نیست."
    );
  }

  /*
   * The payment amount ALWAYS comes from
   * the database.
   *
   * Never trust the frontend amount.
   */
  const amount = Number(order.totalPrice);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Invalid order payment amount."
    );
  }

  /*
   * IMPORTANT:
   *
   * Do NOT reuse an old pending payment.
   *
   * The previous ZarinPal authority may have
   * expired, which causes:
   *
   * "شناسه پرداخت ارسال شده منقضی گردیده است"
   *
   * We mark the previous attempt as FAILED
   * and create a completely new payment attempt.
   */
  const pendingPayment =
    await findPendingPaymentByOrder(order.id);

  if (pendingPayment) {
    await prisma.payment.updateMany({
      where: {
        id: pendingPayment.id,
        status: "PENDING",
      },
      data: {
        status: "FAILED",
      },
    });
  }

  /*
   * Request a fresh authority from ZarinPal.
   */
  const payment =
    await provider.requestPayment({
      amount,
      callbackUrl: getCallbackUrl(),
      description: `Order #${order.id}`,
    });

  /*
   * Save the NEW payment attempt.
   */
  const createdPayment =
    await createPayment({
      orderId: order.id,
      amount,
      authority: payment.authority,
    });

  return {
    paymentId: createdPayment.id,
    authority: payment.authority,
    paymentUrl: payment.paymentUrl,
  };
}

/**
 * Cancel a payment attempt without cancelling
 * the entire order.
 *
 * This is used when ZarinPal sends:
 *
 * Status != OK
 *
 * The order remains PENDING so the user can
 * retry payment.
 */
export async function cancelPayment(
  authority: string
) {
  if (
    typeof authority !== "string" ||
    !authority.trim()
  ) {
    throw new Error(
      "Invalid payment authority"
    );
  }

  const payment =
    await prisma.payment.findUnique({
      where: {
        authority: authority.trim(),
      },
      include: {
        order: true,
      },
    });

  if (!payment) {
    throw new Error("Payment not found");
  }

  /*
   * Already paid payments must never be
   * changed to FAILED.
   */
  if (payment.status === "PAID") {
    return {
      success: true,
      orderId: payment.orderId,
      referenceId:
        payment.transactionId,
      alreadyProcessed: true,
    };
  }

  /*
   * Only this payment attempt becomes FAILED.
   *
   * The ORDER stays PENDING.
   *
   * This is important because the stock was
   * reserved for the order and the user should
   * still be able to retry payment.
   */
  await prisma.payment.updateMany({
    where: {
      id: payment.id,
      status: "PENDING",
    },
    data: {
      status: "FAILED",
    },
  });

  return {
    success: false,
    orderId: payment.orderId,
    status: "CANCELLED",
    message: "Payment was cancelled.",
  };
}

/**
 * Verify a payment using ZarinPal.
 *
 * This function is idempotent.
 */
export async function verifyPayment(
  authority: string
) {
  if (
    typeof authority !== "string" ||
    !authority.trim()
  ) {
    throw new Error(
      "Invalid payment authority"
    );
  }

  const payment =
    await prisma.payment.findUnique({
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
   * Already processed payment.
   */
  if (payment.status === "PAID") {
    return {
      success: true,
      orderId: payment.orderId,
      referenceId:
        payment.transactionId,
      alreadyVerified: true,
    };
  }

  const order = payment.order;

  /*
   * If another payment attempt already paid
   * this order, don't process this one.
   */
  if (order.paymentStatus === "PAID") {
    return {
      success: true,
      orderId: order.id,
      referenceId:
        payment.transactionId,
      alreadyVerified: true,
    };
  }

  /*
   * The order must still be pending.
   */
  if (order.status !== "PENDING") {
    throw new Error(
      "Order is no longer available for payment"
    );
  }

  /*
   * This payment attempt must still be pending.
   */
  if (payment.status !== "PENDING") {
    return {
      success: false,
      orderId: order.id,
      message:
        "Payment is no longer pending",
    };
  }

  /*
   * SECURITY:
   *
   * Use the amount stored in the payment/order.
   * Never accept amount from the client.
   */
  const amount = Number(payment.amount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Invalid payment amount"
    );
  }

  /*
   * Ask ZarinPal to verify the payment.
   */
  const verification =
    await provider.verifyPayment({
      authority: payment.authority,
      amount,
    });

  /*
   * PAYMENT FAILED
   *
   * IMPORTANT:
   *
   * We only fail THIS payment attempt.
   *
   * We DO NOT cancel the Order.
   *
   * Therefore the user can return to the
   * order page and press "تلاش مجدد برای پرداخت".
   */
  if (!verification.success) {
    const result =
      await prisma.$transaction(
        async (tx) => {
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

          if (
            paymentUpdate.count !== 1
          ) {
            return {
              alreadyProcessed: true,
            };
          }

          return {
            alreadyProcessed: false,
          };
        }
      );

    return {
      success: false,
      orderId: order.id,
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
  const result =
    await prisma.$transaction(
      async (tx) => {
        /*
         * Only a PENDING payment can
         * transition to PAID.
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
         * Another request already processed
         * this payment.
         */
        if (
          paymentUpdate.count !== 1
        ) {
          return {
            alreadyPaid: true,
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
          throw new Error(
            "Order not found"
          );
        }

        /*
         * Another payment attempt may have
         * already paid this order.
         */
        if (
          currentOrder.paymentStatus ===
          "PAID"
        ) {
          return {
            alreadyPaid: true,
          };
        }

        if (
          currentOrder.status !==
          "PENDING"
        ) {
          throw new Error(
            "Order is no longer pending"
          );
        }

        /*
         * Mark order as successfully paid.
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
         * Increment actual sold quantity.
         */
        for (
          const item of currentOrder.items
        ) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              purchaseCount: {
                increment:
                  item.quantity,
              },
            },
          });
        }

        /*
         * Remove only the quantity that belonged
         * to this order from the user's cart.
         */
        const cart =
          await tx.cart.findUnique({
            where: {
              userId:
                currentOrder.userId,
            },
          });

        if (cart) {
          for (
            const item of currentOrder.items
          ) {
            const cartItem =
              await tx.cartItem.findUnique({
                where: {
                  cartId_productId: {
                    cartId: cart.id,
                    productId:
                      item.productId,
                  },
                },
              });

            if (!cartItem) {
              continue;
            }

            if (
              cartItem.quantity <=
              item.quantity
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
                    decrement:
                      item.quantity,
                  },
                },
              });
            }
          }
        }

        return {
          alreadyPaid: false,
        };
      }
    );

  return {
    success: true,
    orderId: order.id,
    referenceId:
      verification.referenceId,
    alreadyVerified:
      result.alreadyPaid,
  };
}