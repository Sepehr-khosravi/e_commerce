"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartSkeleton from "@/components/cart/CartSkeleton";

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
  totalItems: number;
  nextCursor: number | null;
  hasMore: boolean;
};

type CartResponse = {
  cart: Cart;
};

const PAGE_SIZE = 20;

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>(
    []
  );

  const [totalItems, setTotalItems] = useState(0);

  const [nextCursor, setNextCursor] = useState<
    number | null
  >(null);

  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const loadingMoreRef = useRef(false);

  const loadMoreRef =
    useRef<HTMLDivElement | null>(null);

  const fetchCart = useCallback(
    async (cursor?: number) => {
      if (cursor !== undefined) {
        if (
          loadingMoreRef.current ||
          !hasMore
        ) {
          return;
        }

        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        setError(null);

        const params = new URLSearchParams();

        params.set(
          "limit",
          String(PAGE_SIZE)
        );

        if (cursor !== undefined) {
          params.set(
            "cursor",
            String(cursor)
          );
        }

        const response = await fetch(
          `/api/cart?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => null);

          throw new Error(
            data?.error ||
              "دریافت سبد خرید با مشکل مواجه شد"
          );
        }

        const data: CartResponse =
          await response.json();

        const cart = data.cart;

        setTotalItems(cart.totalItems);

        setNextCursor(cart.nextCursor);

        setHasMore(cart.hasMore);

        if (cursor === undefined) {
          setItems(cart.items);
        } else {
          setItems((previous) => {
            const existingIds = new Set(
              previous.map((item) => item.id)
            );

            const newItems =
              cart.items.filter(
                (item) =>
                  !existingIds.has(item.id)
              );

            return [
              ...previous,
              ...newItems,
            ];
          });
        }
      } catch (error) {
        console.error(
          "Failed to load cart:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "دریافت سبد خرید با مشکل مواجه شد"
        );
      } finally {
        if (cursor !== undefined) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [hasMore]
  );

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /*
   * Infinite scroll
   */
  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasMore) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (
            entry.isIntersecting &&
            nextCursor !== null &&
            !loadingMoreRef.current
          ) {
            fetchCart(nextCursor);
          }
        },
        {
          rootMargin: "400px",
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    fetchCart,
    nextCursor,
    hasMore,
  ]);

  const handleRemove = async (
    itemId: number
  ) => {
    const previousItems = items;

    setItems((current) =>
      current.filter(
        (item) => item.id !== itemId
      )
    );

    setTotalItems((current) =>
      Math.max(current - 1, 0)
    );

    try {
      const response = await fetch(
        `/api/cart/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "حذف محصول با مشکل مواجه شد"
        );
      }
    } catch (error) {
      console.error(
        "Failed to remove cart item:",
        error
      );

      setItems(previousItems);

      setTotalItems(
        previousItems.length
      );

      setError(
        error instanceof Error
          ? error.message
          : "حذف محصول با مشکل مواجه شد"
      );
    }
  };

  const handleQuantityChange = async (
    itemId: number,
    quantity: number
  ) => {
    const previousItems = items;

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );

    try {
      const response = await fetch(
        `/api/cart/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.error ||
            "تعداد محصول به‌روزرسانی نشد"
        );
      }
    } catch (error) {
      console.error(
        "Failed to update quantity:",
        error
      );

      setItems(previousItems);

      setError(
        error instanceof Error
          ? error.message
          : "تعداد محصول به‌روزرسانی نشد"
      );
    }
  };

  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "خالی کردن سبد خرید با مشکل مواجه شد"
        );
      }

      setItems([]);
      setTotalItems(0);
      setNextCursor(null);
      setHasMore(false);
    } catch (error) {
      console.error(
        "Failed to clear cart:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "خالی کردن سبد خرید با مشکل مواجه شد"
      );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="space-y-4">
            <CartSkeleton />
            <CartSkeleton />
            <CartSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (error && items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag
                size={34}
                className="text-gray-500"
              />
            </div>

            <h1 className="text-2xl font-semibold text-black">
              سبد خرید شما خالی است
            </h1>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              محصولات مورد نظرتان را به سبد
              خرید اضافه کنید تا اینجا نمایش
              داده شوند.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              ادامه خرید

              <ArrowRight size={16} />
            </Link>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <Link
              href="/products"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
            >
              <ArrowLeft size={16} />
              ادامه خرید
            </Link>

            <h1 className="text-3xl font-bold tracking-tight text-black">
              سبد خرید
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {new Intl.NumberFormat(
                "fa-IR"
              ).format(totalItems)}{" "}
              محصول در سبد خرید شما
            </p>

          </div>

          <button
            type="button"
            onClick={handleClearCart}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:self-auto"
          >
            <Trash2 size={16} />
            خالی کردن سبد
          </button>

        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

          <section>

            <div className="space-y-4">

              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onUpdateQuantity={
                    handleQuantityChange
                  }
                />
              ))}

            </div>

            {/* Infinite scroll sentinel */}

            <div
              ref={loadMoreRef}
              className="flex min-h-20 items-center justify-center"
            >

              {loadingMore && (
                <div className="flex items-center gap-3 text-sm text-gray-500">

                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

                  در حال بارگذاری محصولات بیشتر...

                </div>
              )}

              {!loadingMore &&
                !hasMore &&
                items.length > 0 && (
                  <p className="py-6 text-sm text-gray-400">
                    همه محصولات سبد خرید نمایش
                    داده شدند.
                  </p>
                )}

            </div>

          </section>

          <aside>
            <CartSummary items={items} />
          </aside>

        </div>

      </div>
    </main>
  );
}