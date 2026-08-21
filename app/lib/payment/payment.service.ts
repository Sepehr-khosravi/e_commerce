import { prisma } from "../prisma";

import {
  createPayment,
  findPaymentByAuthority,
  markPaymentAsFailed,
  markPaymentAsPaid,
} from "./payment.repository";

import { TestPaymentProvider } from "./payment.provider";

const paymentProvider =
  new TestPaymentProvider();

export async function requestPayment(data: {
  orderId: number;
  amount: number;
  callbackUrl: string;
  description?: string;
}) {
  if (
    !Number.isInteger(data.orderId) ||
    data.orderId <= 0
  ) {
    throw new Error("Invalid order ID");
  }

  if (
    !Number.isFinite(data.amount) ||
    data.amount <= 0
  ) {
    throw new Error("Invalid payment amount");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: data.orderId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.totalPrice !== data.amount) {
    throw new Error(
      "Payment amount does not match order amount"
    );
  }

  if (
    order.paymentStatus === "PAID"
  ) {
    throw new Error(
      "Order has already been paid"
    );
  }

  const result =
    await paymentProvider.createPayment({
      orderId: data.orderId,
      amount: data.amount,
      callbackUrl: data.callbackUrl,
      description: data.description,
    });

  const payment =
    await createPayment({
      orderId: data.orderId,
      amount: data.amount,
      authority: result.authority,
    });

  return {
    payment,
    paymentUrl: result.paymentUrl,
  };
}

export async function verifyPayment(
  authority: string
) {
  if (!authority.trim()) {
    throw new Error(
      "Payment authority is required"
    );
  }

  const payment =
    await findPaymentByAuthority(
      authority
    );

  if (!payment) {
    throw new Error(
      "Payment not found"
    );
  }

  /*
   * Make verification idempotent.
   *
   * If the gateway calls our callback twice,
   * we don't process the payment twice.
   */
  if (
    payment.status === "PAID"
  ) {
    return payment;
  }

  const result =
    await paymentProvider.verifyPayment(
      authority,
      Number(payment.amount)
    );

  if (!result.success) {
    await markPaymentAsFailed(
      payment.id
    );

    throw new Error(
      "Payment verification failed"
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const updatedPayment =
        await tx.payment.update({
          where: {
            id: payment.id,
          },

          data: {
            status: "PAID",
            transactionId:
              result.transactionId,
            paidAt: new Date(),
          },
        });

      await tx.order.update({
        where: {
          id: payment.orderId,
        },

        data: {
          paymentStatus: "PAID",
        },
      });

      return updatedPayment;
    }
  );
}

export async function requestPaymentForUser(
  userId: number,
  orderId: number,
  callbackUrl: string
) {
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  if (order.userId !== userId) {
    throw new Error(
      "You cannot pay for this order"
    );
  }

  return requestPayment({
    orderId,
    amount: order.totalPrice,
    callbackUrl,
    description:
      `Order #${order.id}`,
  });
}