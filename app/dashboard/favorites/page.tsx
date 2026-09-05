"use client";

import Link from "next/link";
import { Heart, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import ProductCard from "@/components/home/ProductCard";
import ProductSkeleton from "@/components/home/ProductSkeleton";

type Product = {
  id: number;
  title: string;
  slug: string;

  price: number | string;
  offer?: number | string | null;

  images: string[];
  description: string;

  count: number;
  purchaseCount: number;

  isFeatured: boolean;
  isActive: boolean;

  categoryId: number;
};

type Favorite = {
  id: number;
  productId: number;
  product: Product;
};

type FavoritesResponse = {
  favorites: Favorite[];
  nextCursor: number | null;
};

const PAGE_SIZE = 20;

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState(false);

  const [nextCursor, setNextCursor] =
    useState<number | null>(null);

  const [hasMore, setHasMore] = useState(true);

  /*
   * Prevent multiple requests from being fired
   * at the same time by the IntersectionObserver.
   */
  const loadingMoreRef = useRef(false);

  /*
   * Sentinel element at the bottom of the list.
   */
  const loadMoreRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * ============================================================
   * FETCH FAVORITES
   * ============================================================
   */
  const fetchFavorites = useCallback(
    async (cursor?: number) => {
      try {
        /*
         * First request
         */
        if (cursor === undefined) {
          setLoading(true);
          setError(false);
        } else {
          /*
           * Prevent duplicate pagination requests.
           */
          if (loadingMoreRef.current) {
            return;
          }

          loadingMoreRef.current = true;
          setLoadingMore(true);
        }

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
          `/api/favorites?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          window.location.href =
            "/login?redirect=/dashboard/favorites";

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to fetch favorites"
          );
        }

        const data: FavoritesResponse =
          await response.json();

        const newFavorites =
          data.favorites ?? [];

        /*
         * First page
         */
        if (cursor === undefined) {
          setFavorites(newFavorites);
        } else {
          /*
           * Additional pages
           */
          setFavorites((current) => [
            ...current,
            ...newFavorites,
          ]);
        }

        /*
         * Backend tells us what cursor
         * should be used for the next request.
         */
        setNextCursor(
          data.nextCursor ?? null
        );

        /*
         * No next cursor means we've reached
         * the end of the list.
         */
        setHasMore(
          data.nextCursor !== null &&
            data.nextCursor !== undefined
        );
      } catch (error) {
        console.error(
          "Failed to fetch favorites:",
          error
        );

        /*
         * Only show the full error screen
         * for the first request.
         */
        if (cursor === undefined) {
          setError(true);
        }
      } finally {
        if (cursor === undefined) {
          setLoading(false);
        } else {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        }
      }
    },
    []
  );

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  /*
   * ============================================================
   * INFINITE SCROLL
   * ============================================================
   */
  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry.isIntersecting) {
            return;
          }

          if (loading) {
            return;
          }

          if (loadingMoreRef.current) {
            return;
          }

          if (!hasMore) {
            return;
          }

          if (nextCursor === null) {
            return;
          }

          fetchFavorites(nextCursor);
        },
        {
          /*
           * Start loading before the user
           * actually reaches the bottom.
           */
          rootMargin: "400px",
          threshold: 0,
        }
      );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    fetchFavorites,
    hasMore,
    loading,
    nextCursor,
  ]);

  /*
   * ============================================================
   * REMOVE FAVORITE
   * ============================================================
   */
  const handleRemoveFavorite = async (
    productId: number
  ) => {
    /*
     * Optimistic update
     */
    const previousFavorites = favorites;

    setFavorites((current) =>
      current.filter(
        (favorite) =>
          favorite.productId !== productId
      )
    );

    try {
      const response = await fetch(
        `/api/favorites/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to remove favorite"
        );
      }
    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      /*
       * Restore previous list if DELETE fails.
       */
      setFavorites(previousFavorites);
    }
  };

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */
  const handleRefresh = async () => {
    /*
     * Reset pagination completely.
     */
    setNextCursor(null);
    setHasMore(true);

    await fetchFavorites();
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white"
    >
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <Link
              href="/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition-colors duration-200 hover:text-black"
            >
              <ArrowRight size={15} />
              داشبورد
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                <Heart
                  size={20}
                  className="fill-black text-black"
                />
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Favorites
                </span>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-black sm:text-3xl">
                  علاقه‌مندی‌های من
                </h1>
              </div>
            </div>

            {!loading && !error && (
              <p className="mt-4 text-sm text-neutral-400">
                {favorites.length} محصول در لیست علاقه‌مندی‌ها
              </p>
            )}
          </div>

          {!loading && !error && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loadingMore}
              className="
                flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-neutral-100
                px-4
                text-xs
                font-semibold
                text-neutral-700
                transition-all
                duration-300
                hover:bg-neutral-200
                disabled:cursor-not-allowed
                disabled:opacity-50
                focus:outline-none
              "
            >
              <RefreshCw
                size={14}
                className={
                  loadingMore
                    ? "animate-spin"
                    : ""
                }
              />

              بروزرسانی
            </button>
          )}
        </div>

        {/* Initial Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <ProductSkeleton
                key={index}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl bg-neutral-50 px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Heart
                size={24}
                className="text-neutral-300"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-black">
              دریافت علاقه‌مندی‌ها ناموفق بود
            </h2>

            <p className="mt-2 text-sm text-neutral-400">
              مشکلی در دریافت اطلاعات پیش آمده.
            </p>

            <button
              type="button"
              onClick={() => {
                setNextCursor(null);
                setHasMore(true);
                fetchFavorites();
              }}
              className="
                mt-6
                rounded-xl
                bg-black
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-neutral-800
                focus:outline-none
              "
            >
              تلاش دوباره
            </button>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          favorites.length === 0 && (
            <div className="rounded-3xl bg-neutral-50 px-6 py-20 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
                <Heart
                  size={30}
                  className="text-neutral-300"
                />
              </div>

              <h2 className="mt-6 text-lg font-bold text-black">
                هنوز محصولی ذخیره نکرده‌اید
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-400">
                محصولاتی که دوست دارید را به
                علاقه‌مندی‌ها اضافه کنید تا بعداً
                راحت‌تر به آن‌ها دسترسی داشته باشید.
              </p>

              <Link
                href="/products"
                className="
                  mt-7
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-black
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-neutral-800
                "
              >
                مشاهده محصولات
              </Link>

            </div>
          )}

        {/* Products */}
        {!loading &&
          !error &&
          favorites.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {favorites.map(
                  (favorite) => (
                    <div
                      key={favorite.id}
                      className="relative"
                    >
                      <ProductCard
                        product={
                          favorite.product
                        }
                      />

                      {/* Remove button */}
                      <button
                        type="button"
                        aria-label="حذف از علاقه‌مندی‌ها"
                        onClick={() =>
                          handleRemoveFavorite(
                            favorite.productId
                          )
                        }
                        className="
                          absolute
                          right-3
                          top-3
                          z-10
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-white/95
                          text-black
                          shadow-md
                          backdrop-blur
                          transition-all
                          duration-300
                          hover:scale-105
                          hover:bg-black
                          hover:text-white
                          focus:outline-none
                        "
                      >
                        <Heart
                          size={17}
                          className="fill-current"
                        />
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* =================================================
                  INFINITE SCROLL SENTINEL
                 ================================================= */}
              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="flex min-h-24 items-center justify-center"
                >
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      در حال دریافت محصولات بیشتر...
                    </div>
                  )}
                </div>
              )}

              {/* End of list */}
              {!hasMore && (
                <div className="mt-10 flex items-center justify-center">
                  <div className="rounded-full bg-neutral-50 px-4 py-2 text-[11px] font-medium text-neutral-400">
                    همه محصولات نمایش داده شدند
                  </div>
                </div>
              )}
            </>
          )}

      </section>
    </main>
  );
}