"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  RefreshCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import CartSection from "./CartSection";
import OrderSkeleton from "./OrderSkeleton";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

type Product = {
  id: number;
  title: string;
  images: string[];
};

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;

  productTitle: string;
  productPrice: string;
  productOffer: string;

  quantity: number;
  totalPrice: string;

  createdAt: string;

  product: Product | null;
};

type Order = {
  id: number;
  userId: number;

  firstName: string;
  lastName: string;
  phone: string;
  address: string;

  totalPrice: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  createdAt: string;
  updatedAt: string;

  items: OrderItem[];
};

type OrdersResponse = {
  orders: Order[];
  nextCursor: number | null;
  hasMore: boolean;
};

const LIMIT = 10;

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

function formatTime(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getOrderStatus(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return {
        label: "در انتظار بررسی",
        icon: Clock3,
        className:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      };

    case "PROCESSING":
      return {
        label: "در حال پردازش",
        icon: Package,
        className:
          "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      };

    case "SHIPPED":
      return {
        label: "ارسال شده",
        icon: Truck,
        className:
          "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
      };

    case "DELIVERED":
      return {
        label: "تحویل داده شده",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      };

    case "CANCELLED":
      return {
        label: "لغو شده",
        icon: XCircle,
        className:
          "bg-red-50 text-red-700 ring-1 ring-red-100",
      };

    case "REFUNDED":
      return {
        label: "بازپرداخت شده",
        icon: RefreshCcw,
        className:
          "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
      };

    default:
      return {
        label: "نامشخص",
        icon: Clock3,
        className:
          "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
      };
  }
}

function getPaymentStatus(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return {
        label: "پرداخت موفق",
        className: "text-emerald-600",
      };

    case "PENDING":
      return {
        label: "در انتظار پرداخت",
        className: "text-amber-600",
      };

    case "FAILED":
      return {
        label: "پرداخت ناموفق",
        className: "text-red-600",
      };

    case "REFUNDED":
      return {
        label: "وجه بازگردانده شد",
        className: "text-neutral-500",
      };

    default:
      return {
        label: "نامشخص",
        className: "text-neutral-500",
      };
  }
}

function CartComponent() {
  return (
    <section className="mb-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
              <ShoppingBag size={18} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-black">
                سبد خرید
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                محصولاتی که هنوز خرید آن‌ها نهایی نشده است.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/cart"
          className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-black sm:flex"
        >
          مشاهده سبد خرید
          <ArrowLeft size={14} />
        </Link>
      </div>

      <CartSection />
    </section>
  );
}

function PageHeader({
  totalOrders,
}: {
  totalOrders: number;
}) {
  return (
    <header className="mb-10">
      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition hover:text-black"
      >
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />

        داشبورد
      </Link>

      <div className="mt-7 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-400">
            My Orders
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            سفارش‌های من
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-500">
            سفارش‌های ثبت‌شده، وضعیت پرداخت و وضعیت ارسال
            خریدهای خود را مشاهده کنید.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
            <Package size={17} />
          </div>

          <div>
            <p className="text-[10px] font-medium text-neutral-400">
              مجموع سفارش‌ها
            </p>

            <p className="mt-0.5 text-sm font-bold text-black">
              {totalOrders.toLocaleString("fa-IR")} سفارش
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function OrderSummary({
  orders,
}: {
  orders: Order[];
}) {
  const summary = useMemo(() => {
    return {
      total: orders.length,

      active: orders.filter(
        (order) =>
          order.status === "PENDING" ||
          order.status === "PROCESSING" ||
          order.status === "SHIPPED"
      ).length,

      delivered: orders.filter(
        (order) => order.status === "DELIVERED"
      ).length,

      paid: orders.filter(
        (order) => order.paymentStatus === "PAID"
      ).length,
    };
  }, [orders]);

  const cards = [
    {
      title: "همه سفارش‌ها",
      value: summary.total,
      icon: ShoppingBag,
    },
    {
      title: "سفارش‌های فعال",
      value: summary.active,
      icon: Truck,
    },
    {
      title: "تحویل شده",
      value: summary.delivered,
      icon: CheckCircle2,
    },
    {
      title: "پرداخت موفق",
      value: summary.paid,
      icon: CreditCard,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                <Icon size={16} />
              </div>

              <span className="text-xl font-bold text-black">
                {card.value.toLocaleString("fa-IR")}
              </span>
            </div>

            <p className="mt-4 text-xs font-medium text-neutral-500">
              {card.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ProductPreview({
  item,
}: {
  item: OrderItem;
}) {
  const image = item.product?.images?.[0];

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-neutral-50 p-2.5">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
        {image ? (
          <img
            src={image.startsWith("/") ? image : `/${image}`}
            alt={item.product?.title ?? item.productTitle}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <Package size={18} />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-black">
          {item.product?.title ?? item.productTitle}
        </p>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-neutral-400">
            تعداد:
          </span>

          <span className="text-[10px] font-semibold text-neutral-600">
            {item.quantity.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
}: {
  order: Order;
}) {
  const status = getOrderStatus(order.status);
  const payment = getPaymentStatus(order.paymentStatus);

  const StatusIcon = status.icon;

  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="border-b border-neutral-100 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-black px-2.5 py-1 text-[10px] font-bold text-white">
                #{order.id}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
              >
                <StatusIcon size={12} />
                {status.label}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400">
              <span>
                {formatDate(order.createdAt)}
              </span>

              <span className="h-1 w-1 rounded-full bg-neutral-300" />

              <span>
                ساعت {formatTime(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-neutral-400">
              مبلغ نهایی
            </p>

            <div className="mt-1 flex items-baseline justify-end gap-1">
              <span className="text-xl font-bold text-black">
                {formatPrice(order.totalPrice)}
              </span>

              <span className="text-[10px] text-neutral-400">
                تومان
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-black">
            محصولات سفارش
          </h3>

          <span className="text-[10px] text-neutral-400">
            {order.items.length.toLocaleString("fa-IR")} قلم
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <ProductPreview
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-neutral-100 bg-neutral-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <CreditCard
              size={15}
              className="text-neutral-400"
            />

            <div>
              <p className="text-[9px] text-neutral-400">
                وضعیت پرداخت
              </p>

              <p
                className={`mt-0.5 text-[11px] font-semibold ${payment.className}`}
              >
                {payment.label}
              </p>
            </div>
          </div>

          <div className="h-7 w-px bg-neutral-200" />

          <div>
            <p className="text-[9px] text-neutral-400">
              تعداد محصولات
            </p>

            <p className="mt-0.5 text-[11px] font-semibold text-black">
              {order.items
                .reduce(
                  (sum, item) =>
                    sum + item.quantity,
                  0
                )
                .toLocaleString("fa-IR")}{" "}
              عدد
            </p>
          </div>
        </div>

        <Link
          href={`/dashboard/orders/${order.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white transition hover:bg-neutral-800"
        >
          مشاهده جزئیات
          <ArrowLeft size={14} />
        </Link>
      </div>
    </article>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Package
          size={25}
          className="text-neutral-300"
        />
      </div>

      <h3 className="mt-6 text-base font-bold text-black">
        هنوز سفارشی ثبت نکرده‌اید
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-neutral-400">
        بعد از ثبت اولین سفارش، اطلاعات خرید و وضعیت
        ارسال آن را در اینجا مشاهده خواهید کرد.
      </p>

      <Link
        href="/products"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
      >
        مشاهده محصولات
        <ArrowLeft size={14} />
      </Link>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
        <XCircle
          size={22}
          className="text-neutral-400"
        />
      </div>

      <h3 className="mt-5 text-sm font-bold text-black">
        {message}
      </h3>

      <p className="mt-2 text-xs text-neutral-400">
        لطفاً دوباره تلاش کنید.
      </p>

      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
      >
        <RefreshCcw size={14} />
        تلاش مجدد
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [cursor, setCursor] =
    useState<number | null>(null);

  const [hasMore, setHasMore] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const fetchOrders = useCallback(
    async (
      nextCursor: number | null = null
    ) => {
      try {
        if (nextCursor === null) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const params =
          new URLSearchParams();

        params.set(
          "limit",
          String(LIMIT)
        );

        if (nextCursor !== null) {
          params.set(
            "cursor",
            String(nextCursor)
          );
        }

        const response =
          await fetch(
            `/api/orders?${params.toString()}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          if (
            response.status === 401
          ) {
            throw new Error(
              "Unauthorized"
            );
          }

          throw new Error(
            data.error ||
              "Failed to fetch orders"
          );
        }

        const result: OrdersResponse =
          data;

        setOrders((current) =>
          nextCursor === null
            ? result.orders
            : [
                ...current,
                ...result.orders,
              ]
        );

        setCursor(
          result.nextCursor
        );

        setHasMore(
          result.hasMore
        );
      } catch (error) {
        console.error(
          "Orders page error:",
          error
        );

        if (
          error instanceof Error &&
          error.message ===
            "Unauthorized"
        ) {
          setError(
            "برای مشاهده سفارش‌ها ابتدا وارد حساب کاربری شوید."
          );
        } else {
          setError(
            "دریافت سفارش‌ها با مشکل مواجه شد."
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <PageHeader
          totalOrders={orders.length}
        />

        {/* <CartComponent /> */}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <OrderSummary
              orders={orders}
            />
          )}

        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-black">
                  <Package size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-black">
                    تاریخچه سفارش‌ها
                  </h2>

                  <p className="mt-1 text-xs text-neutral-400">
                    تمام خریدهای ثبت‌شده شما
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <OrderSkeleton
                  key={index}
                />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() =>
                fetchOrders(null)
              }
            />
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}

              {hasMore &&
                cursor !== null && (
                  <div className="flex justify-center pt-5">
                    <button
                      disabled={
                        loadingMore
                      }
                      onClick={() =>
                        fetchOrders(
                          cursor
                        )
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-xs font-semibold text-black shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />

                          در حال دریافت...
                        </>
                      ) : (
                        <>
                          سفارش‌های بیشتر

                          <ArrowLeft
                            size={14}
                          />
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}