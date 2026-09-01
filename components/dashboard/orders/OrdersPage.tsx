"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import OrderCard from "./OrderCard";
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
  userId: number;

  firstName: string;
  lastName: string;
  phone: string;
  address: string;

  totalPrice: number | string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  items: OrderItem[];

  createdAt: string;
  updatedAt: string;
};

type OrdersResponse = {
  orders: Order[];
  nextCursor: number | null;
  hasNextPage: boolean;
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

export function cartComponent(){
  return (
      <>
        {/* Cart */}
        <section className="mb-12">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                  <ShoppingBag size={17} />
                </div>

                <h2 className="text-lg font-bold text-black">
                  سبد خرید
                </h2>

              </div>

              <p className="mt-2 text-xs text-neutral-400">
                محصولاتی که هنوز خرید آن‌ها
                نهایی نشده است.
              </p>

            </div>

            <Link
              href="/cart"
              className="hidden items-center gap-2 text-xs font-semibold text-black sm:flex"
            >
              مشاهده سبد خرید
              <ArrowLeft size={14} />
            </Link>

          </div>

          <CartSection />

        </section>
      </>

  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);

  const [cursor, setCursor] =
    useState<number | null>(null);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const fetchOrders = useCallback(
    async (nextCursor: number | null = null) => {
      try {
        if (nextCursor !== null) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const params = new URLSearchParams();

        params.set("limit", String(LIMIT));

        if (nextCursor !== null) {
          params.set(
            "cursor",
            String(nextCursor)
          );
        }

        const response = await fetch(
          `/api/orders?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to fetch orders"
          );
        }

        const result: OrdersResponse = data;

        setOrders((current) =>
          nextCursor === null
            ? result.orders
            : [...current, ...result.orders]
        );

        setCursor(result.nextCursor);
        setHasNextPage(result.hasNextPage);
      } catch (error) {
        console.error(
          "Orders page error:",
          error
        );

        if (
          error instanceof Error &&
          error.message === "Unauthorized"
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
      className="min-h-screen bg-white"
    >
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-10">

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition hover:text-black"
          >
            <ArrowRight size={14} />
            داشبورد
          </Link>

          <div className="mt-6">

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              My Orders
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              سفارش‌های من
            </h1>

            <p className="mt-3 text-sm leading-7 text-neutral-500">
              سبد خرید و خریدهای نهایی‌شده
              خود را مدیریت کنید.
            </p>

          </div>

        </header>


        {/* Orders */}
        <section>

          <div className="mb-5">

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-black">
                <Package size={17} />
              </div>

              <h2 className="text-lg font-bold text-black">
                خریدهای نهایی‌شده
              </h2>

            </div>

            <p className="mt-2 text-xs text-neutral-400">
              تاریخچه سفارش‌هایی که ثبت کرده‌اید.
            </p>

          </div>


          {loading ? (

            <div className="space-y-4">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <OrderSkeleton
                    key={index}
                  />
                )
              )}
            </div>

          ) : error ? (

            <div className="rounded-3xl bg-neutral-50 px-6 py-16 text-center">

              <h3 className="text-sm font-bold text-black">
                {error}
              </h3>

              <button
                onClick={() =>
                  fetchOrders()
                }
                className="mt-5 rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                تلاش مجدد
              </button>

            </div>

          ) : orders.length === 0 ? (

            <div className="rounded-3xl bg-neutral-50 px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <Package
                  size={22}
                  className="text-neutral-400"
                />
              </div>

              <h3 className="mt-5 text-base font-bold text-black">
                هنوز سفارشی ندارید
              </h3>

              <p className="mt-2 text-xs text-neutral-400">
                وقتی خریدی انجام دهید،
                سفارش‌های شما اینجا نمایش داده
                می‌شوند.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                مشاهده محصولات
                <ArrowLeft size={14} />
              </Link>

            </div>

          ) : (

            <div className="space-y-4">

              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}


              {hasNextPage && (
                <button
                  disabled={loadingMore}
                  onClick={() =>
                    fetchOrders(cursor)
                  }
                  className="mx-auto mt-7 flex h-11 items-center gap-2 rounded-xl bg-neutral-100 px-6 text-xs font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
                      در حال دریافت...
                    </>
                  ) : (
                    <>
                      نمایش سفارش‌های بیشتر
                      <ArrowLeft size={14} />
                    </>
                  )}
                </button>
              )}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}