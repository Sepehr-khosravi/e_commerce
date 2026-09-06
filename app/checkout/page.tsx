"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

type CheckoutUser = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
};

type Product = {
  id: number;
  title: string;
  price: number | string;
  offer: number | string | null;
  images: string[];
};

type CartItem = {
  id: number;
  quantity: number;
  product: Product;
};

type Cart = {
  id: number;
  items: CartItem[];
};

function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString(
    "fa-IR"
  )} تومان`;
}

function getFinalPrice(
  price: number,
  offer: number | string | null
) {
  const discount =
    offer === null
      ? 0
      : Number(offer);

  return price * (1 - discount / 100);
}

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<CheckoutUser | null>(null);

  const [cart, setCart] =
    useState<Cart | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/checkout",
          {
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "خطا در دریافت اطلاعات"
          );
        }

        setUser(data.user);
        setCart(data.cart);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "خطا در دریافت اطلاعات"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const total = useMemo(() => {
    if (!cart) return 0;

    return cart.items.reduce(
      (sum, item) => {
        const price =
          Number(item.product.price);

        const finalPrice =
          getFinalPrice(
            price,
            item.product.offer
          );

        return (
          sum +
          finalPrice *
            item.quantity
        );
      },
      0
    );
  }, [cart]);

  const totalItems = useMemo(() => {
    if (!cart) return 0;

    return cart.items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );
  }, [cart]);

  function updateField(
    field: keyof CheckoutUser,
    value: string
  ) {
    setUser((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!user || !cart) return;

    setError("");

    if (!user.firstName.trim()) {
      setError(
        "لطفاً نام خود را وارد کنید."
      );
      return;
    }

    if (!user.lastName.trim()) {
      setError(
        "لطفاً نام خانوادگی خود را وارد کنید."
      );
      return;
    }

    if (
      !/^09\d{9}$/.test(
        user.phone.trim()
      )
    ) {
      setError(
        "شماره موبایل باید با اعداد انگلیسی و به صورت 09xxxxxxxxx باشد."
      );
      return;
    }

    if (!user.address.trim()) {
      setError(
        "لطفاً آدرس ارسال را وارد کنید."
      );
      return;
    }

    if (!cart.items.length) {
      setError(
        "سبد خرید شما خالی است."
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderResponse =
        await fetch(
          "/api/orders",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              firstName:
                user.firstName,
              lastName:
                user.lastName,
              phone:
                user.phone,
              address:
                user.address,
            }),
          }
        );

      const orderData =
        await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error ||
            "خطا در ایجاد سفارش"
        );
      }

      const orderId =
        orderData.order.orderId;

      const paymentResponse =
        await fetch(
          "/api/payment/request",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              orderId,
            }),
          }
        );

      const paymentData =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.error ||
            "خطا در شروع پرداخت"
        );
      }

      window.location.href =
        paymentData.paymentUrl;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد."
      );

      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#fafafa]"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="animate-pulse">
            <div className="h-5 w-28 rounded-full bg-neutral-200" />

            <div className="mt-4 h-10 w-64 rounded-xl bg-neutral-200" />

            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="h-[600px] rounded-[28px] bg-neutral-200" />
              <div className="h-[500px] rounded-[28px] bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user || !cart) {
    return null;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#fafafa]"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">

        {/* Header */}
        <header className="mb-8 sm:mb-10">

          <button
            type="button"
            onClick={() =>
              router.push("/cart")
            }
            className="group mb-5 flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-black"
          >
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />

            بازگشت به سبد خرید
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#FF5858]">
                <ShoppingBag size={15} />

                تکمیل سفارش
              </div>

              <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
                نهایی کردن خرید
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
                اطلاعات ارسال را بررسی کنید و
                سفارش خود را برای پرداخت نهایی
                ثبت کنید.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-500 shadow-sm sm:self-auto">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                {totalItems}
              </span>

              کالا در سفارش
            </div>

          </div>

        </header>

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6"
        >

          {/* Main */}
          <div className="min-w-0 space-y-5">

            {/* Progress */}
            <div className="hidden rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:block">
              <div className="flex items-center">

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                    <Check size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">
                      مرحله ۱
                    </p>
                    <p className="text-sm font-bold text-black">
                      سبد خرید
                    </p>
                  </div>
                </div>

                <div className="mx-5 h-px flex-1 bg-black" />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5858] text-white">
                    <UserRound size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-[#FF5858]">
                      مرحله ۲
                    </p>
                    <p className="text-sm font-bold text-black">
                      اطلاعات ارسال
                    </p>
                  </div>
                </div>

                <div className="mx-5 h-px flex-1 bg-neutral-200" />

                <div className="flex items-center gap-3 opacity-40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
                    <CreditCard size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">
                      مرحله ۳
                    </p>
                    <p className="text-sm font-bold text-black">
                      پرداخت
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Shipping */}
            <section className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">

              <div className="border-b border-neutral-100 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-black">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="text-base font-black text-black sm:text-lg">
                      اطلاعات ارسال
                    </h2>

                    <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                      اطلاعاتی که برای این سفارش
                      استفاده می‌شود
                    </p>
                  </div>

                </div>
              </div>

              <div className="p-5 sm:p-7">

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* First name */}
                  <label className="block">
                    <span className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-neutral-600">
                      نام
                    </span>

                    <div className="relative">
                      <UserRound
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        value={
                          user.firstName
                        }
                        onChange={(event) =>
                          updateField(
                            "firstName",
                            event.target
                              .value
                          )
                        }
                        autoComplete="given-name"
                        placeholder="مثلاً سپهر"
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-[#fafafa] pr-11 pl-4 text-sm font-medium text-black outline-none transition placeholder:text-neutral-300 hover:border-neutral-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                      />
                    </div>
                  </label>

                  {/* Last name */}
                  <label className="block">
                    <span className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-neutral-600">
                      نام خانوادگی
                    </span>

                    <div className="relative">
                      <UserRound
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      />

                      <input
                        value={
                          user.lastName
                        }
                        onChange={(event) =>
                          updateField(
                            "lastName",
                            event.target
                              .value
                          )
                        }
                        autoComplete="family-name"
                        placeholder="نام خانوادگی"
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-[#fafafa] pr-11 pl-4 text-sm font-medium text-black outline-none transition placeholder:text-neutral-300 hover:border-neutral-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                      />
                    </div>
                  </label>

                </div>

                {/* Phone */}
                <label className="mt-5 block">
                  <span className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-neutral-600">
                    شماره موبایل
                  </span>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      value={user.phone}
                      onChange={(event) =>
                        updateField(
                          "phone",
                          event.target.value
                        )
                      }
                      inputMode="numeric"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="09123456789"
                      className="h-12 w-full rounded-2xl border border-neutral-200 bg-[#fafafa] px-4 pr-11 text-left text-sm font-medium tracking-wide text-black outline-none transition placeholder:text-neutral-300 hover:border-neutral-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-neutral-400">
                    شماره موبایل را با اعداد
                    انگلیسی وارد کنید.
                  </p>
                </label>

                {/* Address */}
                <label className="mt-5 block">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600">
                      آدرس کامل
                    </span>

                    <span className="text-[11px] text-neutral-400">
                      آدرس تحویل سفارش
                    </span>
                  </div>

                  <textarea
                    value={user.address}
                    onChange={(event) =>
                      updateField(
                        "address",
                        event.target
                          .value
                      )
                    }
                    rows={5}
                    autoComplete="street-address"
                    placeholder="استان، شهر، خیابان، کوچه، پلاک و واحد..."
                    className="w-full resize-none rounded-2xl border border-neutral-200 bg-[#fafafa] px-4 py-3.5 text-sm font-medium leading-7 text-black outline-none transition placeholder:text-neutral-300 hover:border-neutral-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                  />
                </label>

                {error && (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-600">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black">
                      !
                    </div>

                    <span>
                      {error}
                    </span>
                  </div>
                )}

              </div>

            </section>

            {/* Security */}
            <div className="flex items-start gap-3 rounded-[24px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-black">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-black">
                  پرداخت امن
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-400">
                  اطلاعات سفارش شما امن نگه داشته
                  می‌شود و پرداخت از طریق درگاه
                  بانکی انجام خواهد شد.
                </p>
              </div>

            </div>

          </div>

          {/* Summary */}
          <aside className="h-fit lg:sticky lg:top-6">

            <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">

              {/* Summary header */}
              <div className="border-b border-neutral-100 p-5 sm:p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-base font-black text-black sm:text-lg">
                      خلاصه سفارش
                    </h2>

                    <p className="mt-1 text-xs text-neutral-400">
                      {totalItems.toLocaleString(
                        "fa-IR"
                      )}{" "}
                      کالا
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                    <ShoppingBag size={19} />
                  </div>

                </div>

              </div>

              {/* Items */}
              <div className="max-h-[390px] overflow-y-auto p-5 sm:p-6">

                <div className="space-y-5">

                  {cart.items.map(
                    (item) => {
                      const price =
                        Number(
                          item.product
                            .price
                        );

                      const offer =
                        item.product
                          .offer ===
                        null
                          ? 0
                          : Number(
                              item.product
                                .offer
                            );

                      const finalPrice =
                        getFinalPrice(
                          price,
                          offer
                        );

                      const itemTotal =
                        finalPrice *
                        item.quantity;

                      const image =
                        item.product
                          .images?.[0];

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3"
                        >

                          {/* Product image */}
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">

                            {image ? (
                              <img
                                src={image}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                                <Package
                                  size={20}
                                />
                              </div>
                            )}

                            <span className="absolute bottom-1 right-1 flex min-w-5 items-center justify-center rounded-md bg-black px-1.5 py-0.5 text-[9px] font-bold text-white">
                              {item.quantity}
                            </span>

                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">

                            <p className="line-clamp-2 text-xs font-bold leading-5 text-black sm:text-sm">
                              {
                                item
                                  .product
                                  .title
                              }
                            </p>

                            <div className="mt-1.5 flex flex-wrap items-center gap-2">

                              {offer > 0 && (
                                <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                                  {offer.toLocaleString(
                                    "fa-IR"
                                  )}
                                  ٪ تخفیف
                                </span>
                              )}

                            </div>

                          </div>

                          {/* Price */}
                          <div className="shrink-0 text-left">
                            <p className="text-xs font-black text-black sm:text-sm">
                              {Math.round(
                                itemTotal
                              ).toLocaleString(
                                "fa-IR"
                              )}
                            </p>

                            <p className="mt-0.5 text-[10px] text-neutral-400">
                              تومان
                            </p>
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* Price */}
              <div className="border-t border-neutral-100 p-5 sm:p-6">

                <div className="space-y-3">

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">
                      تعداد کالا
                    </span>

                    <span className="font-bold text-black">
                      {totalItems.toLocaleString(
                        "fa-IR"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">
                      هزینه ارسال
                    </span>

                    <span className="font-bold text-green-600">
                      رایگان
                    </span>
                  </div>

                </div>

                <div className="my-5 border-t border-dashed border-neutral-200" />

                <div className="flex items-end justify-between gap-4">

                  <div>
                    <p className="text-xs text-neutral-400">
                      مبلغ قابل پرداخت
                    </p>

                    <p className="mt-1 text-xl font-black tracking-tight text-black sm:text-2xl">
                      {Math.round(
                        total
                      ).toLocaleString(
                        "fa-IR"
                      )}
                    </p>
                  </div>

                  <span className="pb-1 text-xs font-medium text-neutral-400">
                    تومان
                  </span>

                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      در حال آماده‌سازی پرداخت...
                    </>
                  ) : (
                    <>
                      ادامه و پرداخت
                      <ArrowLeft
                        size={17}
                        className="transition-transform group-hover:-translate-x-1"
                      />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/cart"
                    )
                  }
                  disabled={submitting}
                  className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 text-sm font-bold text-black transition hover:bg-neutral-50 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  ویرایش سبد خرید
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                  <ShieldCheck size={13} />
                  پرداخت امن و محافظت‌شده
                </div>

              </div>

            </div>

          </aside>

        </form>
      </div>
    </main>
  );
}