"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

type CartProduct = {
  id: number;
  count: number;
};

type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  product?: CartProduct;
};

type CartResponse = {
  cart: {
    id: number;
    items: CartItem[];
  };
};

type Props = {
  productId: number;
  productCount: number;
};

export default function AddToCart({
  productId,
  productCount,
}: Props) {
  const [itemId, setItemId] =
    useState<number | null>(null);

  const [quantity, setQuantity] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "/api/cart",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        setItemId(null);
        setQuantity(0);
        return;
      }

      const data: CartResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "Failed to fetch cart"
        );
      }

      const existingItem =
        data.cart.items.find(
          (item) =>
            item.productId === productId
        );

      if (existingItem) {
        setItemId(existingItem.id);
        setQuantity(
          existingItem.quantity
        );
      } else {
        setItemId(null);
        setQuantity(0);
      }
    } catch (error) {
      console.error(
        "Product cart check error:",
        error
      );

      setError(
        "وضعیت سبد خرید دریافت نشد."
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async () => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(
        "/api/cart",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity: 1,
          }),
        }
      );

      if (response.status === 401) {
        window.location.href =
          `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`;

        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to add product"
        );
      }

      /*
       * API returns the newly created/updated
       * cart item.
       */
      setItemId(data.item.id);

      setQuantity(
        Number(data.item.quantity)
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "افزودن به سبد خرید انجام نشد."
      );
    } finally {
      setUpdating(false);
    }
  };

  const updateQuantity = async (
    nextQuantity: number
  ) => {
    if (!itemId) return;

    if (nextQuantity <= 0) {
      await removeFromCart();
      return;
    }

    if (
      nextQuantity > productCount
    ) {
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(
        `/api/cart/${itemId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: nextQuantity,
          }),
        }
      );

      if (response.status === 401) {
        window.location.href =
          `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`;

        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update cart"
        );
      }

      setQuantity(
        Number(data.item.quantity)
      );
    } catch (error) {
      console.error(
        "Update cart error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "تغییر تعداد انجام نشد."
      );
    } finally {
      setUpdating(false);
    }
  };

  const removeFromCart = async () => {
    if (!itemId) return;

    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(
        `/api/cart/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        window.location.href =
          `/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`;

        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to remove item"
        );
      }

      setItemId(null);
      setQuantity(0);
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حذف از سبد خرید انجام نشد."
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
   * Product is out of stock.
   */
  if (productCount <= 0) {
    return (
      <div className="rounded-2xl bg-neutral-100 px-5 py-4 text-center text-sm font-semibold text-neutral-500">
        این محصول در حال حاضر موجود نیست.
      </div>
    );
  }

  /*
   * Initial loading.
   */
  if (loading) {
    return (
      <div className="h-14 w-full animate-pulse rounded-2xl bg-neutral-100" />
    );
  }

  /*
   * Product is already in cart.
   */
  if (itemId !== null && quantity > 0) {
    return (
      <div className="space-y-3">

        <div className="flex h-14 items-center justify-between overflow-hidden rounded-2xl bg-black text-white">

          <button
            type="button"
            disabled={updating}
            onClick={() =>
              updateQuantity(
                quantity - 1
              )
            }
            className="flex h-full w-14 items-center justify-center transition hover:bg-neutral-800 disabled:opacity-40"
          >
            <Minus size={17} />
          </button>

          <div className="flex items-center gap-2">

            <Check size={16} />

            <span className="text-sm font-bold">
              {new Intl.NumberFormat(
                "fa-IR"
              ).format(quantity)}
            </span>

            <span className="text-xs text-neutral-300">
              عدد در سبد
            </span>

          </div>

          <button
            type="button"
            disabled={
              updating ||
              quantity >= productCount
            }
            onClick={() =>
              updateQuantity(
                quantity + 1
              )
            }
            className="flex h-full w-14 items-center justify-center transition hover:bg-neutral-800 disabled:opacity-40"
          >
            <Plus size={17} />
          </button>

        </div>

        <div className="flex items-center justify-between">

          <button
            type="button"
            disabled={updating}
            onClick={removeFromCart}
            className="text-xs font-medium text-neutral-400 transition hover:text-red-500 disabled:opacity-40"
          >
            حذف از سبد خرید
          </button>

          <a
            href="/cart"
            className="text-xs font-semibold text-black transition hover:text-neutral-500"
          >
            مشاهده سبد خرید ←
          </a>

        </div>

        {error && (
          <p className="text-xs text-red-500">
            {error}
          </p>
        )}

      </div>
    );
  }

  /*
   * Product isn't in cart.
   */
  return (
    <div className="space-y-3">

      <button
        type="button"
        disabled={updating}
        onClick={addToCart}
        className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-black text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >

        {updating ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-500 border-t-white" />
            در حال افزودن...
          </>
        ) : (
          <>
            <ShoppingCart
              size={18}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            افزودن به سبد خرید
          </>
        )}

      </button>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}