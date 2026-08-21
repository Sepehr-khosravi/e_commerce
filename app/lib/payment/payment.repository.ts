import { prisma } from "../prisma";

export async function createPayment(
  data: {
    orderId: number;
    amount: number;
    authority: string;
  }
) {
  return prisma.payment.create({
    data: {
      orderId: data.orderId,
      amount: data.amount,
      authority: data.authority,
      status: "PENDING",
    },
  });
}

export async function findPaymentByAuthority(
  authority: string
) {
  return prisma.payment.findUnique({
    where: {
      authority,
    },

    include: {
      order: true,
    },
  });
}

export async function markPaymentAsPaid(
  paymentId: number,
  transactionId: string
) {
  return prisma.payment.update({
    where: {
      id: paymentId,
    },

    data: {
      status: "PAID",
      transactionId,
      paidAt: new Date(),
    },
  });
}

export async function markPaymentAsFailed(
  paymentId: number
) {
  return prisma.payment.update({
    where: {
      id: paymentId,
    },

    data: {
      status: "FAILED",
    },
  });
}