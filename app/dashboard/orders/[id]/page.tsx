"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import OrderHeader from "@/components/orders/OrderHeader";
import OrderStatus from "@/components/orders/OrderStatus";
import OrderTimeline from "@/components/orders/OrderTimeline";
import OrderItems from "@/components/orders/OrderItems";
import ShippingInfo from "@/components/orders/ShippingInfo";
import OrderSummary from "@/components/orders/OrderSummary";

export type OrderStatusType =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatusType =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type OrderItem = {
  id: number;
  productId: number;
  productTitle: string;
  productPrice: number | string;
  productOffer: number | string;
  quantity: number;
  totalPrice: number | string;
  createdAt?: string;
};

export type Order = {
  id: number;
  userId: number;

  firstName: string;
  lastName: string;
  phone: string;
  address: string;

  totalPrice: number | string;

  status: OrderStatusType;
  paymentStatus: PaymentStatusType;

  items: OrderItem[];

  createdAt: string;
  updatedAt: string;
};

function formatPrice(value: number | string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "۰";
  }

  return new Intl.NumberFormat("fa-IR").format(number);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [error, setError] = useState("");

  const orderId = params.id;

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to get order");
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Failed to fetch order:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load order"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /*
   * Payment is allowed only when the order is still active
   * and has not already been paid.
   *
   * PENDING + PENDING  -> Continue payment
   * PENDING + FAILED   -> Retry payment
   *
   * CANCELLED orders must NOT be paid again.
   */
  const canContinuePayment =
    order?.status === "PENDING" &&
    order.paymentStatus !== "PAID" &&
    order.paymentStatus !== "REFUNDED";

  const paymentButtonText =
    order?.paymentStatus === "FAILED"
      ? "تلاش مجدد برای پرداخت"
      : "ادامه پرداخت";

  async function handleContinuePayment() {
    if (!order || !canContinuePayment || paymentLoading) {
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");

      /*
       * IMPORTANT:
       * We intentionally do NOT send:
       *
       * - userId
       * - amount
       * - price
       * - payment information
       *
       * The server gets the authenticated user from the session
       * and calculates the payment amount from the Order in DB.
       */
      const response = await fetch(
        `/api/orders/${order.id}/payment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || "شروع پرداخت ناموفق بود."
        );
      }

      if (
        typeof data.paymentUrl !== "string" ||
        !data.paymentUrl
      ) {
        throw new Error("آدرس درگاه پرداخت دریافت نشد.");
      }

      /*
       * Redirect directly to the payment gateway.
       */
      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error("Failed to continue payment:", error);

      setPaymentError(
        error instanceof Error
          ? error.message
          : "شروع پرداخت ناموفق بود."
      );

      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded-xl bg-neutral-200" />

            <div className="h-32 rounded-3xl bg-neutral-200" />

            <div className="h-28 rounded-3xl bg-neutral-200" />

            <div className="h-36 rounded-3xl bg-neutral-200" />

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="h-96 rounded-3xl bg-neutral-200" />
              <div className="h-72 rounded-3xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <TriangleAlert size={26} />
          </div>

          <h1 className="text-xl font-bold text-black">
            سفارش پیدا نشد
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {error ||
              "این سفارش وجود ندارد یا به آن دسترسی ندارید."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard/orders")}
            className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            بازگشت به سفارش‌ها
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Header */}
        <OrderHeader
          orderId={order.id}
          createdAt={formatDate(order.createdAt)}
        />

        {/* Order / Payment status */}
        <div className="mt-5 sm:mt-6">
          <OrderStatus
            status={order.status}
            paymentStatus={order.paymentStatus}
          />
        </div>

        {/* =====================================================
            CONTINUE PAYMENT
            ===================================================== */}

        {canContinuePayment && (
          <section className="mt-5 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm sm:mt-6">
            <div className="relative p-5 sm:p-6">
              {/* Accent */}
              <div className="absolute inset-y-0 right-0 w-1 bg-[#FF5858]" />

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

                {/* Information */}
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#FF5858]">
                    <CreditCard size={22} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-black text-black sm:text-base">
                        پرداخت سفارش تکمیل نشده
                      </h2>

                      {order.paymentStatus === "FAILED" && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                          پرداخت ناموفق
                        </span>
                      )}

                      {order.paymentStatus === "PENDING" && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">
                          در انتظار پرداخت
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 max-w-xl text-xs leading-6 text-neutral-500 sm:text-sm">
                      {order.paymentStatus === "FAILED"
                        ? "پرداخت قبلی این سفارش کامل نشده است. می‌توانید دوباره پرداخت را امتحان کنید."
                        : "برای تکمیل سفارش، پرداخت مبلغ سفارش را ادامه دهید."}
                    </p>
                  </div>
                </div>

                {/* Payment button */}
                <button
                  type="button"
                  onClick={handleContinuePayment}
                  disabled={paymentLoading}
                  className="group flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[190px]"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      در حال انتقال...
                    </>
                  ) : (
                    <>
                      <CreditCard size={17} />

                      {paymentButtonText}

                      <ArrowLeft
                        size={17}
                        className="transition-transform group-hover:-translate-x-1"
                      />
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {paymentError && (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-xs leading-6 text-red-600">
                  <TriangleAlert
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{paymentError}</span>
                </div>
              )}

              {/* Security */}
              <div className="mt-4 flex items-center gap-2 text-[10px] text-neutral-400">
                <ShieldCheck size={13} />
                مبلغ پرداخت توسط سرور بررسی و به درگاه ارسال می‌شود.
              </div>
            </div>
          </section>
        )}

        {/* Paid information */}
        {order.paymentStatus === "PAID" && (
          <section className="mt-5 rounded-3xl border border-green-100 bg-white shadow-sm sm:mt-6">
            <div className="flex items-center gap-4 p-5 sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <CheckCircle2 size={23} />
              </div>

              <div>
                <h2 className="text-sm font-black text-black sm:text-base">
                  پرداخت با موفقیت انجام شده
                </h2>

                <p className="mt-1 text-xs leading-6 text-neutral-500 sm:text-sm">
                  پرداخت این سفارش تأیید شده و سفارش شما در حال پردازش است.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Cancelled information */}
        {order.status === "CANCELLED" && (
          <section className="mt-5 rounded-3xl border border-red-100 bg-white shadow-sm sm:mt-6">
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <TriangleAlert size={22} />
              </div>

              <div>
                <h2 className="text-sm font-black text-black sm:text-base">
                  این سفارش لغو شده است
                </h2>

                <p className="mt-1 text-xs leading-6 text-neutral-500 sm:text-sm">
                  این سفارش دیگر قابل پرداخت نیست. برای خرید مجدد،
                  باید یک سفارش جدید ایجاد شود.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Timeline */}
        <div className="mt-5 sm:mt-6">
          <OrderTimeline
            status={order.status}
            createdAt={order.createdAt}
          />
        </div>

        {/* Main content */}
        <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-[1fr_360px]">

          <div className="space-y-5 sm:space-y-6">

            <OrderItems
              items={order.items}
              formatPrice={formatPrice}
            />

            <ShippingInfo
              firstName={order.firstName}
              lastName={order.lastName}
              phone={order.phone}
              address={order.address}
            />

          </div>

          <OrderSummary
            totalPrice={order.totalPrice}
            items={order.items}
            formatPrice={formatPrice}
          />

        </div>
      </div>
    </main>
  );
}