"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

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

function formatPrice(
  value: number
) {
  return `${Math.round(
    value
  ).toLocaleString("fa-IR")} تومان`;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [
    user,
    setUser,
  ] = useState<CheckoutUser | null>(
    null
  );

  const [
    cart,
    setCart,
  ] = useState<Cart | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response =
          await fetch(
            "/api/checkout",
            {
              cache: "no-store",
            }
          );

        if (
          response.status === 401
        ) {
          router.push("/login");
          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load checkout"
          );
        }

        setUser(data.user);
        setCart(data.cart);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load checkout"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const total =
    useMemo(() => {
      if (!cart) {
        return 0;
      }

      return cart.items.reduce(
        (sum, item) => {
          const price =
            Number(
              item.product.price
            );

          const offer =
            item.product.offer ===
            null
              ? 0
              : Number(
                  item.product.offer
                );

          const finalPrice =
            price *
            (1 - offer / 100);

          return (
            sum +
            finalPrice *
              item.quantity
          );
        },
        0
      );
    }, [cart]);

  function updateField(
    field: keyof CheckoutUser,
    value: string
  ) {
    setUser(
      (current) =>
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

    if (!user || !cart) {
      return;
    }

    setError("");

    if (!user.firstName.trim()) {
      setError(
        "First name is required."
      );
      return;
    }

    if (!user.lastName.trim()) {
      setError(
        "Last name is required."
      );
      return;
    }

    if (
      !/^09\d{9}$/.test(
        user.phone.trim()
      )
    ) {
      setError(
        "Please enter your phone number using English digits only."
      );
      return;
    }

    if (!user.address.trim()) {
      setError(
        "Address is required."
      );
      return;
    }

    if (!cart.items.length) {
      setError(
        "Your cart is empty."
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
            "Failed to create order"
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
            "Failed to start payment"
        );
      }

      window.location.href =
        paymentData.paymentUrl;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-neutral-200" />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="h-[500px] animate-pulse rounded-3xl bg-neutral-100" />

          <div className="h-[400px] animate-pulse rounded-3xl bg-neutral-100" />
        </div>
      </main>
    );
  }

  if (!user || !cart) {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-[#FF5858]">
          Checkout
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-black">
          Complete your order
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_380px]"
      >
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Shipping information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Enter the information you want
            to use for this order.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                First name
              </span>

              <input
                value={
                  user.firstName
                }
                onChange={(event) =>
                  updateField(
                    "firstName",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#FF5858] focus:ring-2 focus:ring-[#FF5858]/10"
                autoComplete="given-name"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Last name
              </span>

              <input
                value={
                  user.lastName
                }
                onChange={(event) =>
                  updateField(
                    "lastName",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#FF5858] focus:ring-2 focus:ring-[#FF5858]/10"
                autoComplete="family-name"
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium">
              Phone number
            </span>

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
              placeholder="09123456789"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#FF5858] focus:ring-2 focus:ring-[#FF5858]/10"
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium">
              Shipping address
            </span>

            <textarea
              value={
                user.address
              }
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value
                )
              }
              rows={6}
              autoComplete="street-address"
              placeholder="Enter your complete shipping address..."
              className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 leading-7 outline-none transition focus:border-[#FF5858] focus:ring-2 focus:ring-[#FF5858]/10"
            />
          </label>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-xl font-bold">
            Order summary
          </h2>

          <div className="mt-6 space-y-5">
            {cart.items.map(
              (item) => {
                const price =
                  Number(
                    item.product.price
                  );

                const offer =
                  item.product
                    .offer === null
                    ? 0
                    : Number(
                        item.product
                          .offer
                      );

                const finalPrice =
                  price *
                  (1 - offer / 100);

                const itemTotal =
                  finalPrice *
                  item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {
                          item.product
                            .title
                        }
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Quantity:{" "}
                        {
                          item.quantity
                        }
                      </p>
                    </div>

                    <p className="shrink-0 font-medium">
                      {formatPrice(
                        itemTotal
                      )}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          <div className="my-6 h-px bg-neutral-200" />

          <div className="flex items-center justify-between">
            <span className="text-neutral-500">
              Total
            </span>

            <span className="text-xl font-bold">
              {formatPrice(total)}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-[#FF5858] px-5 py-3.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Creating order..."
              : "Continue to payment"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/cart")
            }
            disabled={submitting}
            className="mt-3 w-full rounded-xl border border-neutral-200 px-5 py-3.5 font-semibold text-black transition hover:bg-neutral-50 disabled:opacity-50"
          >
            Back to cart
          </button>
        </aside>
      </form>
    </main>
  );
}