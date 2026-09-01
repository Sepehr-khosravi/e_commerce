"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import ProductCard from "@/components/home/ProductCard";
import ProductSkeleton from "@/components/home/ProductSkeleton";
import Navbar from "../navbar/Navbar";

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
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
};

type ProductResponse = {
  products: Product[];
  nextCursor: number | null;
  hasNextPage: boolean;
};

const LIMIT = 12;

const SORT_OPTIONS = [
  {
    value: "popular",
    label: "محبوب‌ترین",
  },
  {
    value: "newest",
    label: "جدیدترین",
  },
  {
    value: "oldest",
    label: "قدیمی‌ترین",
  },
  {
    value: "price_asc",
    label: "ارزان‌ترین",
  },
  {
    value: "price_desc",
    label: "گران‌ترین",
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [categoryId, setCategoryId] =
    useState<number | null>(null);

  const [sort, setSort] = useState("popular");

  const [cursor, setCursor] =
    useState<number | null>(null);

  const [hasNextPage, setHasNextPage] =
    useState(true);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const observerRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const data = await response.json();

        setCategories(
          Array.isArray(data)
            ? data
            : data.categories ?? []
        );
      } catch (error) {
        console.error(
          "Category fetch error:",
          error
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /*
   * Products
   */
  const fetchProducts = useCallback(
    async (
      nextCursor: number | null = null,
      replace = false
    ) => {
      try {
        if (replace) {
          setInitialLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params = new URLSearchParams();

        params.set("limit", String(LIMIT));
        params.set("sort", sort);

        if (activeSearch.trim()) {
          params.set(
            "query",
            activeSearch.trim()
          );
        }

        if (categoryId !== null) {
          params.set(
            "categoryId",
            String(categoryId)
          );
        }

        if (nextCursor !== null) {
          params.set(
            "cursor",
            String(nextCursor)
          );
        }

        const response = await fetch(
          `/api/products?${params.toString()}`,
          {
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
          replace
            ? data.products
            : [...current, ...data.products]
        );

        setCursor(data.nextCursor);
        setHasNextPage(data.hasNextPage);
      } catch (error) {
        console.error(
          "Product fetch error:",
          error
        );
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [activeSearch, categoryId, sort]
  );

  /*
   * Initial / filter fetch
   */
  useEffect(() => {
    setCursor(null);
    setHasNextPage(true);

    fetchProducts(null, true);
  }, [
    activeSearch,
    categoryId,
    sort,
    fetchProducts,
  ]);

  /*
   * Infinite scroll
   */
  useEffect(() => {
    const element = observerRef.current;

    if (
      !element ||
      !hasNextPage ||
      loadingMore ||
      initialLoading
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (
            entry.isIntersecting &&
            cursor !== null
          ) {
            fetchProducts(cursor, false);
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
    initialLoading,
    fetchProducts,
  ]);

  /*
   * Search
   */
  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setActiveSearch(search);
  };

  const clearSearch = () => {
    setSearch("");
    setActiveSearch("");
  };

  return (
    <>
      <main className="min-h-screen bg-white">
  
        {/* Header */}
        <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8">
  
          <div className="max-w-2xl">
  
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Store
            </span>
  
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
              همه محصولات
            </h1>
  
            <p className="mt-4 text-sm leading-7 text-neutral-500 sm:text-base">
              مجموعه‌ای از محصولات تکنولوژی را
              بررسی کنید و محصول مناسب خودتان را
              پیدا کنید.
            </p>
  
          </div>
  
        </section>
  
  
        {/* Search + filters */}
        <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
  
          <div className="flex flex-col gap-4">
  
  
  
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  
              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
  
                <button
                  onClick={() =>
                    setCategoryId(null)
                  }
                  className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${
                    categoryId === null
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  همه
                </button>
  
                {categoriesLoading
                  ? Array.from({
                      length: 4,
                    }).map((_, index) => (
                      <div
                        key={index}
                        className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-neutral-100"
                      />
                    ))
                  : categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          setCategoryId(
                            category.id
                          )
                        }
                        className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${
                          categoryId ===
                          category.id
                            ? "bg-black text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
              </div>
  
  
              {/* Sort */}
              <div className="relative shrink-0">
  
                <SlidersHorizontal
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
  
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value)
                  }
                  className="h-10 appearance-none rounded-xl bg-neutral-100 px-10 pl-9 text-xs font-semibold text-neutral-700 outline-none transition hover:bg-neutral-200"
                >
                  {SORT_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
  
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
  
        {/* Products */}
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-6 lg:px-8">
  
          {initialLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <ProductSkeleton
                  key={index}
                />
              ))}
            </div>
          ) : products.length === 0 ? (
  
            <div className="rounded-3xl bg-neutral-50 px-6 py-20 text-center">
  
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <Search
                  size={21}
                  className="text-neutral-400"
                />
              </div>
  
              <h2 className="mt-5 text-lg font-bold text-black">
                محصولی پیدا نشد
              </h2>
  
              <p className="mt-2 text-sm text-neutral-400">
                عبارت جستجو یا فیلترهای خود را
                تغییر دهید.
              </p>
  
              {(activeSearch ||
                categoryId !== null) && (
                <button
                  onClick={() => {
                    clearSearch();
                    setCategoryId(null);
                  }}
                  className="mt-5 rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  حذف فیلترها
                </button>
              )}
  
            </div>
  
          ) : (
  
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
  
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
                  className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {loadingMore &&
                    Array.from({
                      length: 3,
                    }).map((_, index) => (
                      <ProductSkeleton
                        key={index}
                      />
                    ))}
                </div>
              )}
  
  
              {!hasNextPage && (
                <div className="mt-14 text-center">
                  <p className="text-xs font-medium text-neutral-400">
                    همه محصولات موجود نمایش
                    داده شدند.
                  </p>
                </div>
              )}
  
            </>
  
          )}
  
        </section>
  
      </main>
    </>
  );
}