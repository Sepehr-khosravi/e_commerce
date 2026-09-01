"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import CartSkeleton from "./CartSkeleton";

type Product = {
  id: number;
  title: string;
  slug: string;
  price: number | string;
  offer?: number | string | null;
  images: string[];
  count: number;
  isActive: boolean;
};

type CartItemType = {
  id: number;
  quantity: number;
  productId: number;
  product: Product;
};

type Cart = {
  id: number;
  items: CartItemType[];
};

type CartResponse = {
  cart: Cart;
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/cart", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        throw new Error(
          data.error || "Failed to fetch cart"
        );
      }

      const result: CartResponse = data;

      setCart(result.cart);
    } catch (error) {
      console.error("Cart fetch error:", error);

      setError(
        "دریافت اطلاعات سبد خرید با مشکل مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const removeItem = async (itemId: number) => {
    try {
      const response = await fetch(
        `/api/cart/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to remove item"
        );
      }

      setCart((current) => {
        if (!current) return current;

        return {
          ...current,
          items: current.items.filter(
            (item) => item.id !== itemId
          ),
        };
      });
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error
      );

      setError(
        "حذف محصول از سبد خرید انجام نشد."
      );
    }
  };

  const updateQuantity = async (
    itemId: number,
    quantity: number
  ) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const response = await fetch(
        `/api/cart/${itemId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update quantity"
        );
      }

      setCart((current) => {
        if (!current) return current;

        return {
          ...current,
          items: current.items.map(
            (item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity,
                  }
                : item
          ),
        };
      });
    } catch (error) {
      console.error(
        "Update cart error:",
        error
      );

      setError(
        "تغییر تعداد محصول انجام نشد."
      );
    }
  };

  const clearCart = async () => {
    if (!cart?.items.length) return;

    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟"
    );

    if (!confirmed) return;

    try {
      setClearing(true);

      const response = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to clear cart"
        );
      }

      setCart((current) =>
        current
          ? {
              ...current,
              items: [],
            }
          : current
      );
    } catch (error) {
      console.error(
        "Clear cart error:",
        error
      );

      setError(
        "خالی کردن سبد خرید انجام نشد."
      );
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-white"
      >
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

          <CartHeader />

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">

            <div className="space-y-4">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <CartSkeleton key={index} />
                )
              )}
            </div>

            <div className="hidden lg:block">
              <div className="h-72 animate-pulse rounded-3xl bg-neutral-50" />
            </div>

          </div>

        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-white"
      >
        <div className="mx-auto max-w-6xl px-5 py-8">

          <CartHeader />

          <div className="mt-10 rounded-3xl bg-neutral-50 px-6 py-20 text-center">

            <p className="text-sm font-semibold text-black">
              {error}
            </p>

            <button
              onClick={fetchCart}
              className="mt-5 rounded-xl bg-black px-6 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              تلاش مجدد
            </button>

          </div>

        </div>
      </main>
    );
  }

  const items = cart?.items ?? [];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white"
    >
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

        <CartHeader />

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_340px]">

            {/* Items */}
            <section>

              <div className="mb-4 flex items-center justify-between">

                <p className="text-xs font-semibold text-neutral-500">
                  {new Intl.NumberFormat(
                    "fa-IR"
                  ).format(items.length)}{" "}
                  محصول
                </p>

                <button
                  onClick={clearCart}
                  disabled={clearing}
                  className="flex items-center gap-2 text-xs font-medium text-neutral-400 transition hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 size={14} />

                  {clearing
                    ? "در حال حذف..."
                    : "خالی کردن سبد"}
                </button>

              </div>

              <div className="space-y-3">

                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={
                      updateQuantity
                    }
                  />
                ))}

              </div>

            </section>


            {/* Summary */}
            <CartSummary items={items} />

          </div>
        )}

      </div>
    </main>
  );
}


/* Header */

function CartHeader() {
  return (
    <header>

      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition hover:text-black"
      >
        <ArrowRight size={14} />
        ادامه خرید
      </Link>

      <div className="mt-6">

        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
          Shopping Cart
        </span>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
          سبد خرید
        </h1>

        <p className="mt-3 text-sm leading-7 text-neutral-500">
          محصولات انتخاب‌شده خود را بررسی
          کنید و برای ثبت سفارش آماده شوید.
        </p>

      </div>

    </header>
  );
}


/* Empty */

function EmptyCart() {
  return (
    <div className="mt-10 rounded-3xl bg-neutral-50 px-6 py-24 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
        <ShoppingBag
          size={24}
          className="text-neutral-400"
        />
      </div>

      <h2 className="mt-6 text-base font-bold text-black">
        سبد خرید شما خالی است
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-neutral-400">
        هنوز محصولی به سبد خرید خود اضافه
        نکرده‌اید. محصولات موردنظر خود را
        پیدا کنید و به سبد اضافه کنید.
      </p>

      <Link
        href="/products"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
      >
        مشاهده محصولات
        <ArrowLeft size={14} />
      </Link>

    </div>
  );
}