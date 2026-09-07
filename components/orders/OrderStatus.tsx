import {
  CheckCircle2,
  Clock3,
  CreditCard,
  XCircle,
  RotateCcw,
  PackageCheck,
} from "lucide-react";

import type {
  OrderStatusType,
  PaymentStatusType,
} from "@/app/dashboard/orders/[id]/page";

type Props = {
  status: OrderStatusType;
  paymentStatus: PaymentStatusType;
};

const orderStatusMap = {
  PENDING: {
    label: "در انتظار پردازش",
    icon: Clock3,
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  PROCESSING: {
    label: "در حال پردازش",
    icon: PackageCheck,
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  SHIPPED: {
    label: "ارسال شده",
    icon: PackageCheck,
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  DELIVERED: {
    label: "تحویل داده شده",
    icon: CheckCircle2,
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  CANCELLED: {
    label: "لغو شده",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  REFUNDED: {
    label: "مبلغ بازپرداخت شده",
    icon: RotateCcw,
    className:
      "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const paymentStatusMap = {
  PENDING: {
    label: "در انتظار پرداخت",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  PAID: {
    label: "پرداخت موفق",
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  FAILED: {
    label: "پرداخت ناموفق",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  REFUNDED: {
    label: "بازپرداخت شده",
    className:
      "bg-purple-50 text-purple-700 border-purple-200",
  },
};

export default function OrderStatus({
  status,
  paymentStatus,
}: Props) {
  const order = orderStatusMap[status];
  const payment = paymentStatusMap[paymentStatus];

  const OrderIcon = order.icon;

  return (
    <div className="grid gap-4 sm:grid-cols-2">

      <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">

        <p className="mb-3 text-xs font-medium text-neutral-400">
          وضعیت سفارش
        </p>

        <div
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold ${order.className}`}
        >
          <OrderIcon size={17} />
          {order.label}
        </div>

      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">

        <p className="mb-3 text-xs font-medium text-neutral-400">
          وضعیت پرداخت
        </p>

        <div
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold ${payment.className}`}
        >
          <CreditCard size={17} />
          {payment.label}
        </div>

      </div>

    </div>
  );
}