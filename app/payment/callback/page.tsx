"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  Check,
  Clock3,
  CreditCard,
  Home,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";

export default function PaymentCallbackPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const [loading, setLoading] =
    useState(true);

  const [success, setSuccess] =
    useState(false);

  const [message, setMessage] =
    useState(
      "در حال بررسی پرداخت..."
    );

  useEffect(() => {
    async function verify() {
      const authority =
        searchParams.get(
          "Authority"
        );

      const status =
        searchParams.get(
          "Status"
        );

      if (!authority) {
        setSuccess(false);

        setMessage(
          "اطلاعات پرداخت معتبر نیست."
        );

        setLoading(false);

        return;
      }

      try {
        const response =
          await fetch(
            `/api/payment/verify?Authority=${encodeURIComponent(
              authority
            )}&Status=${encodeURIComponent(
              status || ""
            )}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              data.message ||
              "تأیید پرداخت ناموفق بود."
          );
        }

        setSuccess(true);

        setMessage(
          "پرداخت شما با موفقیت تأیید شد و سفارش در حال پردازش است."
        );
      } catch (error) {
        setSuccess(false);

        setMessage(
          error instanceof Error
            ? error.message
            : "تأیید پرداخت ناموفق بود."
        );
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [searchParams]);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#fafafa] px-4 py-10 sm:px-6"
      >
        <div className="w-full max-w-md">

          <div className="rounded-[32px] border border-neutral-200 bg-white p-7 text-center shadow-sm sm:p-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-neutral-100">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-neutral-200 border-t-black" />
            </div>

            <div className="mt-7">

              <div className="mx-auto h-7 w-48 animate-pulse rounded-lg bg-neutral-200" />

              <div className="mx-auto mt-3 h-4 w-64 animate-pulse rounded-lg bg-neutral-100" />

              <div className="mx-auto mt-8 h-12 w-full animate-pulse rounded-2xl bg-neutral-100" />

            </div>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <ShieldCheck size={14} />

              لطفاً صفحه را نبندید
            </div>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#fafafa] px-4 py-10 sm:px-6"
    >
      <div className="w-full max-w-lg">

        {/* Main Card */}
        <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">

          {/* Status */}
          <div
            className={`px-6 pb-8 pt-9 text-center sm:px-10 sm:pb-10 sm:pt-11 ${
              success
                ? "bg-gradient-to-b from-green-50/70 to-white"
                : "bg-gradient-to-b from-red-50/70 to-white"
            }`}
          >

            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] ${
                success
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {success ? (
                <Check
                  size={38}
                  strokeWidth={2.5}
                />
              ) : (
                <X
                  size={38}
                  strokeWidth={2.5}
                />
              )}
            </div>

            <div className="mt-7">

              <div
                className={`mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                  success
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {success ? (
                  <>
                    <Check size={13} />
                    پرداخت موفق
                  </>
                ) : (
                  <>
                    <X size={13} />
                    پرداخت ناموفق
                  </>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-black sm:text-3xl">
                {success
                  ? "پرداخت با موفقیت انجام شد"
                  : "پرداخت انجام نشد"}
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500 sm:text-base">
                {message}
              </p>

            </div>

          </div>

          {/* Details */}
          <div className="border-t border-neutral-100 px-5 py-5 sm:px-7 sm:py-6">

            <div className="rounded-2xl bg-neutral-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-sm">
                  {success ? (
                    <ShoppingBag size={18} />
                  ) : (
                    <CreditCard size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-black">
                    {success
                      ? "سفارش شما ثبت شد"
                      : "پرداخت سفارش کامل نشد"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    {success
                      ? "می‌توانید وضعیت سفارش خود را مشاهده کنید."
                      : "می‌توانید دوباره از طریق سبد خرید اقدام کنید."}
                  </p>
                </div>

              </div>

            </div>

            {/* Info rows */}
            <div className="mt-4 space-y-1">

              <div className="flex items-center justify-between rounded-xl px-3 py-3">
                <span className="text-xs text-neutral-400">
                  وضعیت تراکنش
                </span>

                <span
                  className={`text-xs font-bold ${
                    success
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {success
                    ? "تأیید شده"
                    : "ناموفق"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl px-3 py-3">
                <span className="text-xs text-neutral-400">
                  وضعیت سفارش
                </span>

                <span className="text-xs font-bold text-black">
                  {success
                    ? "در حال پردازش"
                    : "در انتظار پرداخت"}
                </span>
              </div>

            </div>

          </div>

          {/* Actions */}
          <div className="border-t border-neutral-100 p-5 sm:p-7">

            {success ? (
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/orders"
                    )
                  }
                  className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
                >
                  مشاهده سفارش‌های من

                  <ArrowLeft
                    size={17}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/")
                  }
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 text-sm font-bold text-black transition hover:bg-neutral-50 active:scale-[0.99]"
                >
                  <Home size={16} />

                  خانه
                </button>

              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/cart"
                    )
                  }
                  className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
                >
                  بازگشت به سبد خرید

                  <ArrowLeft
                    size={17}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/orders"
                    )
                  }
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 text-sm font-bold text-black transition hover:bg-neutral-50 active:scale-[0.99]"
                >
                  سفارش‌ها

                  <ShoppingBag size={16} />

                </button>

              </div>
            )}

            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-neutral-400">
              <ShieldCheck size={13} />

              اطلاعات پرداخت شما امن است
            </div>

          </div>

        </div>

        {/* Bottom hint */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <Clock3 size={13} />

          نتیجه پرداخت توسط درگاه بانکی تأیید شده است.
        </div>

      </div>
    </main>
  );
}