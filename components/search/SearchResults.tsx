"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import ProductCard from "@/components/home/ProductCard";
import SearchSkeleton from "./SearchSkeleton";

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

type ProductResponse = {
  products: Product[];
  nextCursor: number | null;
  hasNextPage: boolean;
};

type SearchResultsProps = {
  query: string;
  sort: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
};

const LIMIT = 12;

export default function SearchResults({
  query,
  sort,
  categoryId,
  minPrice,
  maxPrice,
}: SearchResultsProps) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [cursor, setCursor] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const [error, setError] =
    useState(false);

  const observerRef =
    useRef<HTMLDivElement | null>(null);

  const fetchProducts = useCallback(
    async (
      nextCursor?: number | null
    ) => {
      try {
        if (
          nextCursor === undefined ||
          nextCursor === null
        ) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(false);

        const params = new URLSearchParams();
        if (query) {
          params.set("q", query);
        }

        if (sort) {
          params.set("sort", sort);
        }

        if (categoryId) {
          params.set(
            "categoryId",
            categoryId
          );
        }

        if (minPrice) {
          params.set(
            "minPrice",
            minPrice
          );
        }

        if (maxPrice) {
          params.set(
            "maxPrice",
            maxPrice
          );
        }

        params.set(
          "limit",
          String(LIMIT)
        );

        if (
          nextCursor !== undefined &&
          nextCursor !== null
        ) {
          params.set(
            "cursor",
            String(nextCursor)
          );
        }

        const response = await fetch(
          `/api/products?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data: ProductResponse =
          await response.json();

        setProducts((current) =>
          nextCursor !== undefined &&
          nextCursor !== null
            ? [
                ...current,
                ...data.products,
              ]
            : data.products
        );

        setCursor(data.nextCursor);

        setHasNextPage(
          data.hasNextPage
        );
      } catch (error) {
        console.error(
          "Search products error:",
          error
        );

        setError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      query,
      sort,
      categoryId,
      minPrice,
      maxPrice,
    ]
  );

  /*
   * وقتی هر کدام از فیلترها تغییر کنند،
   * نتایج باید از ابتدا دریافت شوند.
   */
  useEffect(() => {
    setProducts([]);
    setCursor(null);
    setHasNextPage(false);

    fetchProducts();
  }, [fetchProducts]);

  /*
   * Infinite scroll
   */
  useEffect(() => {
    const element =
      observerRef.current;

    if (
      !element ||
      !hasNextPage ||
      loadingMore ||
      cursor === null
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const firstEntry =
            entries[0];

          if (
            firstEntry.isIntersecting
          ) {
            fetchProducts(cursor);
          }
        },
        {
          rootMargin: "500px",
        }
      );

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, [
    cursor,
    hasNextPage,
    loadingMore,
    fetchProducts,
  ]);

  /*
   * Loading
   */
  if (loading) {
    return <SearchSkeleton />;
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div className="rounded-3xl bg-neutral-50 px-6 py-20 text-center">

        <p className="text-sm font-semibold text-neutral-600">
          دریافت محصولات با مشکل مواجه شد.
        </p>

        <button
          type="button"
          onClick={() =>
            fetchProducts()
          }
          className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800"
        >
          تلاش دوباره
        </button>

      </div>
    );
  }

  /*
   * No results
   */
  if (products.length === 0) {
    return (
      <div className="rounded-3xl bg-neutral-50 px-6 py-20 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
          🔍
        </div>

        <h2 className="mt-5 text-lg font-bold text-black">
          محصولی پیدا نشد
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          فیلترها یا عبارت جستجو را تغییر دهید.
        </p>

      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">

        <p className="text-sm text-neutral-400">
          نمایش{" "}
          <span className="font-bold text-black">
            {products.length}
          </span>{" "}
          محصول
        </p>

      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* Infinite scroll */}
      {hasNextPage && (
        <div
          ref={observerRef}
          className="mt-6"
        >
          {loadingMore && (
            <SearchSkeleton />
          )}
        </div>
      )}

      {/* End */}
      {!hasNextPage && (
        <div className="mt-14 text-center">
          <p className="text-xs font-medium text-neutral-400">
            همه نتایج نمایش داده شدند.
          </p>
        </div>
      )}
    </>
  );
}