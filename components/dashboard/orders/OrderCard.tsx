import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  Truck,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type OrderItem = {
  id: number;
  quantity: number;
  price: number | string;
  title?: string;
  product?: {
    id: number;
    title: string;
    images: string[];
  };
};

type Order = {
  id: number;
  totalPrice: number | string;
  status: OrderStatus;
  paymentStatus: string;
  items: OrderItem[];
  createdAt: string;
};

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Number(value)
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function getStatus(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return {
        label: "در انتظار بررسی",
        icon: Clock3,
      };

    case "PROCESSING":
      return {
        label: "در حال پردازش",
        icon: Package,
      };

    case "SHIPPED":
      return {
        label: "ارسال شده",
        icon: Truck,
      };

    case "DELIVERED":
      return {
        label: "تحویل داده شده",
        icon: CheckCircle2,
      };

    case "CANCELLED":
      return {
        label: "لغو شده",
        icon: Clock3,
      };

    case "REFUNDED":
      return {
        label: "بازپرداخت شده",
        icon: Clock3,
      };

    default:
      return {
        label: "نامشخص",
        icon: Clock3,
      };
  }
}

export default function OrderCard({
  order,
}: {
  order: Order;
}) {
  const status = getStatus(order.status);

  const StatusIcon = status.icon;

  const firstItem = order.items[0];

  const itemCount = order.items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-100 bg-white transition-all duration-300 hover:border-neutral-200 hover:shadow-[0_10px_40px_rgba(0,0,0,0.04)]">

      <div className="p-5 sm:p-6">

        {/* Top */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              سفارش
            </p>

            <h3 className="mt-1 text-sm font-bold text-black">
              #{order.id}
            </h3>

          </div>


          <div className="flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-2">

            <StatusIcon
              size={14}
              className="text-neutral-500"
            />

            <span className="text-[10px] font-semibold text-neutral-600">
              {status.label}
            </span>

          </div>

        </div>


        {/* Products preview */}
        <div className="mt-5 flex items-center gap-3">

          <div className="flex -space-x-3 space-x-reverse">

            {order.items
              .slice(0, 4)
              .map((item) => {

                const image =
                  item.product
                    ?.images?.[0];

                return (
                  <div
                    key={item.id}
                    className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-neutral-100"
                  >

                    {image ? (
                      <img
                        src={image}
                        alt={
                          item.product
                            ?.title ||
                          "Product"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 animate-pulse rounded-lg bg-neutral-200" />
                    )}

                  </div>
                );
              })}

          </div>


          <div className="mr-2 min-w-0">

            <p className="truncate text-xs font-semibold text-black">
              {firstItem?.product
                ?.title ||
                firstItem?.title ||
                "محصول"}
            </p>

            {order.items.length >
              1 && (
              <p className="mt-1 text-[10px] text-neutral-400">
                و{" "}
                {new Intl.NumberFormat(
                  "fa-IR"
                ).format(
                  order.items.length -
                    1
                )}{" "}
                محصول دیگر
              </p>
            )}

            <p className="mt-1 text-[10px] text-neutral-400">
              مجموعاً{" "}
              {new Intl.NumberFormat(
                "fa-IR"
              ).format(itemCount)}{" "}
              عدد
            </p>

          </div>

        </div>


        {/* Bottom */}
        <div className="mt-6 flex flex-col gap-4 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-[10px] text-neutral-400">
              {formatDate(
                order.createdAt
              )}
            </p>

            <p className="mt-1 text-sm font-bold text-black">
              {formatPrice(
                order.totalPrice
              )}{" "}
              <span className="text-[10px] font-medium text-neutral-400">
                تومان
              </span>
            </p>

          </div>


          <Link
            href={`/dashboard/orders/${order.id}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            جزئیات سفارش
            <ArrowLeft size={14} />
          </Link>

        </div>

      </div>

    </article>
  );
}