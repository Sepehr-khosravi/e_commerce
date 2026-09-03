"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  title: string;
  slug: string;

  price: number | string;
  offer?: number | string | null;

  images: string[];

  count: number;

  isFeatured: boolean;
  isActive: boolean;

  category?: Category | null;
};

type ProductResponse = {
  products: Product[];
  nextCursor: number | null;
  hasNextPage: boolean;
};

const LIMIT = 6;

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchProducts = useCallback(
    async (nextCursor?: number | null) => {
      try {
        const params = new URLSearchParams();

        params.set("limit", String(LIMIT));
        params.set("sort", "popular");

        if (nextCursor !== null && nextCursor !== undefined) {
          params.set("cursor", String(nextCursor));
        }

        const response = await fetch(
          `/api/products?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: ProductResponse = await response.json();

        setProducts((current) =>
          nextCursor
            ? [...current, ...data.products]
            : data.products
        );

        setCursor(data.nextCursor);
        setHasNextPage(data.hasNextPage);
      } catch (error) {
        console.error("Product fetch error:", error);
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Infinite scroll
  useEffect(() => {
    const element = observerRef.current;

    if (!element || !hasNextPage || loadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (
          firstEntry.isIntersecting &&
          cursor !== null
        ) {
          setLoadingMore(true);
          fetchProducts(cursor);
        }
      },
      {
        rootMargin: "500px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    cursor,
    hasNextPage,
    loadingMore,
    fetchProducts,
  ]);

  return (
    <section
      id="products"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8"
    >
      {/* Header */}
      {/* <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Featured
          </span>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl">
            محصولات منتخب
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
            مجموعه‌ای از محصولات محبوب و جدید فروشگاه.
          </p>
        </div>

        <a
          href="/products"
          className="hidden text-sm font-semibold text-black transition-all duration-300 hover:-translate-x-1 sm:block"
        >
          مشاهده همه ←
        </a>
      </div> */}

      {/* Initial Skeleton */}
      {initialLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl bg-neutral-50 px-6 py-20 text-center">
          <p className="text-sm font-semibold text-neutral-600">
            محصولی برای نمایش وجود ندارد.
          </p>
        </div>
      ) : (
        <>
          {/* Products */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {/* Infinite Scroll */}
          {hasNextPage && (
            <div
              ref={observerRef}
              className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7"
            >
              {loadingMore &&
                Array.from({ length: 3 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
            </div>
          )}

          {/* End */}
          {!hasNextPage && (
            <div className="mt-14 text-center">
              <p className="text-xs font-medium text-neutral-400">
                همه محصولات موجود نمایش داده شدند.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}