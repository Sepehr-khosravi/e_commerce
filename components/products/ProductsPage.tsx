"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

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

type CategoriesResponse = {
  categories?: Category[];
};

type FilterContentProps = {
  categories: Category[];
  categoriesLoading: boolean;

  sort: string;
  categoryId: number | null;

  minPrice: string;
  maxPrice: string;

  onSortChange: (value: string) => void;
  onCategoryChange: (id: number | null) => void;

  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;

  onApplyPrice: () => void;
  onClearFilters: () => void;
};

type FilterPanelProps = {
  mounted: boolean;
  active: boolean;

  categories: Category[];
  categoriesLoading: boolean;

  sort: string;
  categoryId: number | null;

  minPrice: string;
  maxPrice: string;

  onClose: () => void;

  onSortChange: (value: string) => void;
  onCategoryChange: (id: number | null) => void;

  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;

  onApplyPrice: () => void;
  onClearFilters: () => void;
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

/* =========================================================
   PRICE HELPERS
========================================================= */

function onlyEnglishDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function formatPricePreview(value: string) {
  const digits = onlyEnglishDigits(value);

  if (!digits) {
    return "";
  }

  return Number(digits).toLocaleString("en-US");
}

/* =========================================================
   PRICE INPUT
========================================================= */

type PriceInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function PriceInput({
  value,
  onChange,
  placeholder,
}: PriceInputProps) {
  const formattedValue = formatPricePreview(value);

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          dir="ltr"
          value={value}
          onChange={(event) => {
            onChange(
              onlyEnglishDigits(event.target.value)
            );
          }}
          placeholder={placeholder}
          className="
            h-11
            w-full
            rounded-xl
            bg-white
            px-4
            pl-14
            text-left
            text-sm
            font-medium
            text-black
            outline-none
            transition-all
            duration-200
            placeholder:text-neutral-400
            focus:bg-neutral-50
            focus:ring-2
            focus:ring-black/5
          "
        />

        <span
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-xs
            font-medium
            text-neutral-400
          "
        >
          تومان
        </span>
      </div>

      <div
        className={`
          overflow-hidden
          transition-all
          duration-200
          ease-out
          ${
            formattedValue
              ? "mt-2 max-h-8 opacity-100"
              : "mt-0 max-h-0 opacity-0"
          }
        `}
      >
        <p
          dir="rtl"
          className="
            px-1
            text-[11px]
            font-medium
            text-neutral-400
          "
        >
          {formattedValue} تومان
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FILTER CONTENT
========================================================= */

function FilterContent({
  categories,
  categoriesLoading,
  sort,
  categoryId,
  minPrice,
  maxPrice,
  onSortChange,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onApplyPrice,
  onClearFilters,
}: FilterContentProps) {
  return (
    <div className="space-y-7">
      {/* SORT */}

      <div>
        <p className="mb-3 text-xs font-bold text-black">
          مرتب‌سازی
        </p>

        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => {
            const isActive =
              sort === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onSortChange(option.value)
                }
                className={`
                  rounded-xl
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-black text-white shadow-sm"
                      : "bg-white text-neutral-500 hover:bg-neutral-100 hover:text-black"
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CATEGORY */}

      <div>
        <p className="mb-3 text-xs font-bold text-black">
          دسته‌بندی
        </p>

        {categoriesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    h-10
                    w-full
                    animate-pulse
                    rounded-xl
                    bg-white
                  "
                />
              )
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* ALL */}

            <button
              type="button"
              onClick={() =>
                onCategoryChange(null)
              }
              className={`
                flex
                w-full
                items-center
                justify-between
                rounded-xl
                px-4
                py-3
                text-right
                text-xs
                font-semibold
                transition-all
                duration-200
                ${
                  categoryId === null
                    ? "bg-black text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }
              `}
            >
              <span>
                همه دسته‌بندی‌ها
              </span>

              {categoryId === null && (
                <span>✓</span>
              )}
            </button>

            {/* CATEGORIES */}

            {categories.map((category) => {
              const isActive =
                categoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    onCategoryChange(
                      category.id
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-semibold
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black"
                    }
                  `}
                >
                  <span>
                    {category.name}
                  </span>

                  {isActive && (
                    <span>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* PRICE */}

      <div>
        <p className="mb-3 text-xs font-bold text-black">
          محدوده قیمت
        </p>

        <div className="grid grid-cols-1 gap-4">
          <PriceInput
            value={minPrice}
            onChange={onMinPriceChange}
            placeholder="1500000"
          />

          <PriceInput
            value={maxPrice}
            onChange={onMaxPriceChange}
            placeholder="10000000"
          />
        </div>

        <button
          type="button"
          onClick={onApplyPrice}
          className="
            mt-3
            h-11
            w-full
            rounded-xl
            bg-black
            text-xs
            font-bold
            text-white
            transition-all
            duration-200
            hover:bg-neutral-800
            active:scale-[0.98]
          "
        >
          اعمال محدوده قیمت
        </button>
      </div>

      {/* CLEAR */}

      <button
        type="button"
        onClick={onClearFilters}
        className="
          w-full
          text-xs
          font-semibold
          text-neutral-400
          transition-colors
          duration-200
          hover:text-black
        "
      >
        پاک کردن فیلترها
      </button>
    </div>
  );
}

/* =========================================================
   FILTER PANEL
========================================================= */

function FilterPanel({
  mounted,
  active,
  categories,
  categoriesLoading,
  sort,
  categoryId,
  minPrice,
  maxPrice,
  onClose,
  onSortChange,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onApplyPrice,
  onClearFilters,
}: FilterPanelProps) {
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* OVERLAY */}

      <button
        type="button"
        aria-label="بستن فیلترها"
        onClick={onClose}
        className={`
          absolute
          inset-0
          bg-black/30
          backdrop-blur-[2px]
          transition-opacity
          duration-300
          ease-out
          ${
            active
              ? "opacity-100"
              : "opacity-0"
          }
        `}
      />

      {/* ===================================================
          MOBILE BOTTOM SHEET
      =================================================== */}

      <div
        className={`
          absolute
          inset-x-0
          bottom-0
          max-h-[90vh]
          overflow-y-auto
          rounded-t-[2rem]
          bg-neutral-50
          p-5
          shadow-2xl
          transition-transform
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          md:hidden
          ${
            active
              ? "translate-y-0"
              : "translate-y-full"
          }
        `}
      >
        {/* HANDLE */}

        <div
          className="
            mx-auto
            mb-5
            h-1.5
            w-12
            rounded-full
            bg-neutral-300
          "
        />

        {/* HEADER */}

        <div
          className="
            mb-6
            flex
            items-center
            justify-between
          "
        >
          <div>
            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-neutral-400
              "
            >
              Filters
            </span>

            <h2
              className="
                mt-1
                text-base
                font-bold
                text-black
              "
            >
              فیلتر محصولات
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white
              text-neutral-500
              transition-all
              duration-200
              hover:bg-black
              hover:text-white
              active:scale-90
            "
          >
            <X size={16} />
          </button>
        </div>

        <FilterContent
          categories={categories}
          categoriesLoading={
            categoriesLoading
          }
          sort={sort}
          categoryId={categoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onSortChange={onSortChange}
          onCategoryChange={
            onCategoryChange
          }
          onMinPriceChange={
            onMinPriceChange
          }
          onMaxPriceChange={
            onMaxPriceChange
          }
          onApplyPrice={onApplyPrice}
          onClearFilters={
            onClearFilters
          }
        />
      </div>

      {/* ===================================================
          DESKTOP RIGHT DRAWER
      =================================================== */}

      <div
        className={`
          absolute
          right-0
          top-0
          hidden
          h-full
          w-full
          max-w-md
          overflow-y-auto
          bg-white
          p-7
          shadow-2xl
          transition-transform
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          md:block
          ${
            active
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* HEADER */}

        <div
          className="
            mb-8
            flex
            items-center
            justify-between
          "
        >
          <div>
            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-neutral-400
              "
            >
              Filters
            </span>

            <h2
              className="
                mt-1
                text-lg
                font-bold
                text-black
              "
            >
              فیلترهای بیشتر
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-neutral-100
              text-neutral-500
              transition-all
              duration-200
              hover:bg-black
              hover:text-white
              active:scale-90
            "
          >
            <X size={16} />
          </button>
        </div>

        <FilterContent
          categories={categories}
          categoriesLoading={
            categoriesLoading
          }
          sort={sort}
          categoryId={categoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onSortChange={onSortChange}
          onCategoryChange={
            onCategoryChange
          }
          onMinPriceChange={
            onMinPriceChange
          }
          onMaxPriceChange={
            onMaxPriceChange
          }
          onApplyPrice={onApplyPrice}
          onClearFilters={
            onClearFilters
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function ProductsPage() {
  /* =======================================================
     PRODUCTS
  ======================================================= */

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  /* =======================================================
     FILTERS
  ======================================================= */

  const [categoryId, setCategoryId] =
    useState<number | null>(null);

  const [sort, setSort] =
    useState("popular");

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  const [appliedMinPrice, setAppliedMinPrice] =
    useState("");

  const [appliedMaxPrice, setAppliedMaxPrice] =
    useState("");

  /* =======================================================
     FILTER PANEL
  ======================================================= */

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [filterMounted, setFilterMounted] =
    useState(false);

  const [filterActive, setFilterActive] =
    useState(false);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [cursor, setCursor] =
    useState<number | null>(null);

  const [hasNextPage, setHasNextPage] =
    useState(true);

  /* =======================================================
     LOADING
  ======================================================= */

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  /* =======================================================
     REFS
  ======================================================= */

  const observerRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * IMPORTANT
   *
   * This ref prevents multiple requests
   * for the same cursor.
   *
   * State updates are asynchronous,
   * but ref updates are immediate.
   */
  const loadingMoreRef =
    useRef(false);

  /*
   * This keeps track of the cursor currently
   * being requested.
   *
   * It gives us another layer of protection
   * against duplicate pagination requests.
   */
  const requestedCursorRef =
    useRef<number | null>(null);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const response = await fetch(
          "/api/categories",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const data:
          | Category[]
          | CategoriesResponse =
          await response.json();

        if (cancelled) {
          return;
        }

        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories(
            Array.isArray(data.categories)
              ? data.categories
              : []
          );
        }
      } catch (error) {
        console.error(
          "Category fetch error:",
          error
        );

        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     FILTER PANEL ANIMATION
  ======================================================= */

  useEffect(() => {
    if (filtersOpen) {
      setFilterMounted(true);

      const frame =
        requestAnimationFrame(() => {
          setFilterActive(true);
        });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    setFilterActive(false);

    const timeout =
      window.setTimeout(() => {
        setFilterMounted(false);
      }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [filtersOpen]);

  /* =======================================================
     FILTER PANEL ACTIONS
  ======================================================= */

  function openFilters() {
    setFiltersOpen(true);
  }

  function closeFilters() {
    setFilterActive(false);
    setFiltersOpen(false);
  }

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

  const fetchProducts = useCallback(
    async (
      nextCursor: number | null = null,
      replace = false
    ) => {
      /*
       * ===================================================
       * LOAD MORE LOCK
       * ===================================================
       */

      if (!replace) {
        /*
         * Another pagination request is already running.
         */
        if (loadingMoreRef.current) {
          return;
        }

        /*
         * Same cursor is already being requested.
         */
        if (
          requestedCursorRef.current ===
          nextCursor
        ) {
          return;
        }

        loadingMoreRef.current = true;
        requestedCursorRef.current =
          nextCursor;

        setLoadingMore(true);
      } else {
        /*
         * A new filter/sort request starts
         * a completely new pagination cycle.
         */
        requestedCursorRef.current = null;

        setInitialLoading(true);
      }

      try {
        const params =
          new URLSearchParams();

        params.set(
          "limit",
          String(LIMIT)
        );

        params.set("sort", sort);

        if (categoryId !== null) {
          params.set(
            "categoryId",
            String(categoryId)
          );
        }

        if (appliedMinPrice) {
          params.set(
            "minPrice",
            appliedMinPrice
          );
        }

        if (appliedMaxPrice) {
          params.set(
            "maxPrice",
            appliedMaxPrice
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
            method: "GET",
            cache: "no-store",
          }
        );

        const text =
          await response.text();

        let data:
          | ProductResponse
          | { error?: string };

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          throw new Error(
            "پاسخ سرور JSON معتبر نیست."
          );
        }

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "دریافت محصولات ناموفق بود."
          );
        }

        const result =
          data as ProductResponse;

        const incomingProducts =
          Array.isArray(
            result.products
          )
            ? result.products
            : [];

        /*
         * =================================================
         * UPDATE PRODUCTS
         * =================================================
         */

        setProducts((current) => {
          /*
           * First page / filter change.
           */
          if (replace) {
            /*
             * Even the initial response can theoretically
             * contain duplicate IDs, so clean it here too.
             */
            const unique =
              new Map<number, Product>();

            for (const product of incomingProducts) {
              unique.set(
                product.id,
                product
              );
            }

            return Array.from(
              unique.values()
            );
          }

          /*
           * Infinite scroll.
           *
           * Create a Set containing IDs already rendered.
           */
          const existingIds =
            new Set(
              current.map(
                (product) =>
                  product.id
              )
            );

          /*
           * Only append products that don't already exist.
           */
          const uniqueIncoming =
            incomingProducts.filter(
              (product) => {
                if (
                  existingIds.has(
                    product.id
                  )
                ) {
                  return false;
                }

                existingIds.add(
                  product.id
                );

                return true;
              }
            );

          return [
            ...current,
            ...uniqueIncoming,
          ];
        });

        /*
         * =================================================
         * UPDATE PAGINATION
         * =================================================
         */

        setCursor(
          result.nextCursor ?? null
        );

        setHasNextPage(
          Boolean(
            result.hasNextPage
          )
        );
      } catch (error) {
        console.error(
          "Product fetch error:",
          error
        );

        /*
         * Only clear products on initial load.
         *
         * If load-more fails, keep the products
         * already displayed.
         */
        if (replace) {
          setProducts([]);
        }

        /*
         * Stop infinite scroll after an error
         * instead of repeatedly hammering the API.
         */
        setHasNextPage(false);
      } finally {
        if (replace) {
          setInitialLoading(false);
        } else {
          loadingMoreRef.current =
            false;

          requestedCursorRef.current =
            null;

          setLoadingMore(false);
        }
      }
    },
    [
      categoryId,
      sort,
      appliedMinPrice,
      appliedMaxPrice,
    ]
  );

  /* =======================================================
     RESET PAGINATION WHEN FILTERS CHANGE
  ======================================================= */

  useEffect(() => {
    /*
     * Reset pagination.
     */
    setCursor(null);
    setHasNextPage(true);

    /*
     * Reset request locks.
     */
    loadingMoreRef.current = false;
    requestedCursorRef.current = null;

    /*
     * Load first page.
     */
    fetchProducts(null, true);
  }, [
    categoryId,
    sort,
    appliedMinPrice,
    appliedMaxPrice,
    fetchProducts,
  ]);

  /* =======================================================
     INFINITE SCROLL
  ======================================================= */

  useEffect(() => {
    const element =
      observerRef.current;

    /*
     * Nothing to observe yet.
     */
    if (!element) {
      return;
    }

    /*
     * No more products.
     */
    if (!hasNextPage) {
      return;
    }

    /*
     * Initial page is still loading.
     */
    if (initialLoading) {
      return;
    }

    /*
     * We don't have a cursor.
     *
     * This normally means there is no next page.
     */
    if (cursor === null) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const firstEntry =
            entries[0];

          if (
            !firstEntry?.isIntersecting
          ) {
            return;
          }

          /*
           * Another request is already running.
           */
          if (
            loadingMoreRef.current
          ) {
            return;
          }

          /*
           * Request the current cursor.
           */
          fetchProducts(
            cursor,
            false
          );
        },
        {
          /*
           * Start loading before the user
           * reaches the absolute bottom.
           */
          rootMargin: "500px 0px",
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    cursor,
    hasNextPage,
    initialLoading,
    fetchProducts,
  ]);

  /* =======================================================
     FILTER ACTIONS
  ======================================================= */

  function applyPrice() {
    const nextMinPrice =
      onlyEnglishDigits(minPrice);

    const nextMaxPrice =
      onlyEnglishDigits(maxPrice);

    setAppliedMinPrice(
      nextMinPrice
    );

    setAppliedMaxPrice(
      nextMaxPrice
    );

    closeFilters();
  }

  function clearFilters() {
    setCategoryId(null);

    setSort("popular");

    setMinPrice("");
    setMaxPrice("");

    setAppliedMinPrice("");
    setAppliedMaxPrice("");

    closeFilters();
  }

  function selectCategory(
    id: number | null
  ) {
    setCategoryId(id);
  }

  function selectSort(
    value: string
  ) {
    setSort(value);
  }

  const selectedSort =
    SORT_OPTIONS.find(
      (item) =>
        item.value === sort
    )?.label ??
    "محبوب‌ترین";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-white
      "
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-5
          pb-6
          pt-10
          sm:px-6
          lg:px-8
        "
      >
        <div className="max-w-2xl">
          <span
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Store
          </span>

          <h1
            className="
              mt-2
              text-2xl
              font-bold
              tracking-tight
              text-black
              sm:text-3xl
              lg:text-4xl
            "
          >
            همه محصولات
          </h1>

          <p
            className="
              mt-3
              text-xs
              leading-6
              text-neutral-500
              sm:text-sm
            "
          >
            مجموعه‌ای از محصولات تکنولوژی
            را بررسی کنید و محصول مناسب
            خودتان را پیدا کنید.
          </p>
        </div>
      </section>

      {/* ===================================================
          MOBILE FILTER BUTTON
      =================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-5
          sm:px-6
          md:hidden
          lg:px-8
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <button
            type="button"
            onClick={openFilters}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-black
              px-4
              py-3
              text-xs
              font-bold
              text-white
              transition-all
              duration-200
              hover:bg-neutral-800
              active:scale-[0.97]
            "
          >
            <SlidersHorizontal
              size={15}
            />

            فیلترهای بیشتر
          </button>

          <span
            className="
              text-xs
              font-medium
              text-neutral-400
            "
          >
            {selectedSort}
          </span>
        </div>
      </section>

      {/* ===================================================
          PRODUCTS SECTION
      =================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-5
          pb-20
          pt-6
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            flex
            items-start
            gap-6
          "
        >
          {/* =================================================
              DESKTOP SIDEBAR
          ================================================= */}

          <aside
            className="
              hidden
              w-64
              shrink-0
              md:block
            "
          >
            <div
              className="
                sticky
                top-6
                rounded-3xl
                bg-neutral-50
                p-5
              "
            >
              <div
                className="
                  mb-6
                  flex
                  items-center
                  gap-2
                "
              >
                <SlidersHorizontal
                  size={16}
                  className="text-neutral-500"
                />

                <h2
                  className="
                    text-sm
                    font-bold
                    text-black
                  "
                >
                  فیلتر محصولات
                </h2>
              </div>

              <FilterContent
                categories={categories}
                categoriesLoading={
                  categoriesLoading
                }
                sort={sort}
                categoryId={categoryId}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onSortChange={
                  selectSort
                }
                onCategoryChange={
                  selectCategory
                }
                onMinPriceChange={
                  setMinPrice
                }
                onMaxPriceChange={
                  setMaxPrice
                }
                onApplyPrice={
                  applyPrice
                }
                onClearFilters={
                  clearFilters
                }
              />
            </div>
          </aside>

          {/* =================================================
              PRODUCT AREA
          ================================================= */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            {/* DESKTOP TOP BAR */}

            <div
              className="
                mb-5
                hidden
                items-center
                justify-between
                border-b
                border-neutral-100
                pb-5
                md:flex
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  text-neutral-500
                "
              >
                {products.length > 0
                  ? `${products.length} محصول نمایش داده شده`
                  : "محصولات"}
              </p>

              <button
                type="button"
                onClick={openFilters}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-neutral-50
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-neutral-600
                  transition-all
                  duration-200
                  hover:bg-neutral-100
                  hover:text-black
                  active:scale-[0.98]
                "
              >
                <SlidersHorizontal
                  size={14}
                />

                فیلترهای بیشتر
              </button>
            </div>

            {/* =================================================
                INITIAL LOADING
            ================================================= */}

            {initialLoading ? (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                  sm:gap-4
                "
              >
                {Array.from({
                  length: 8,
                }).map((_, index) => (
                  <ProductSkeleton
                    key={`initial-skeleton-${index}`}
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              /* =================================================
                 EMPTY STATE
              ================================================= */

              <div
                className="
                  rounded-3xl
                  bg-neutral-50
                  px-6
                  py-16
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white
                  "
                >
                  <SlidersHorizontal
                    size={20}
                    className="text-neutral-400"
                  />
                </div>

                <h2
                  className="
                    mt-4
                    text-base
                    font-bold
                    text-black
                  "
                >
                  محصولی پیدا نشد
                </h2>

                <p
                  className="
                    mt-2
                    text-xs
                    text-neutral-400
                  "
                >
                  فیلترهای خود را تغییر دهید
                  و دوباره امتحان کنید.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-4
                    rounded-xl
                    bg-black
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    transition-all
                    duration-200
                    hover:bg-neutral-800
                    active:scale-[0.98]
                  "
                >
                  حذف فیلترها
                </button>
              </div>
            ) : (
              <>
                {/* =================================================
                    PRODUCTS GRID
                ================================================= */}

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                    sm:grid-cols-3
                    sm:gap-4
                  "
                >
                  {products.map(
                    (product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    )
                  )}
                </div>

                {/* =================================================
                    INFINITE SCROLL SENTINEL
                ================================================= */}

                {hasNextPage && (
                  <div
                    ref={observerRef}
                    className="
                      mt-6
                      grid
                      grid-cols-2
                      gap-3
                      sm:grid-cols-3
                      sm:gap-4
                    "
                  >
                    {loadingMore &&
                      Array.from({
                        length: 3,
                      }).map(
                        (_, index) => (
                          <ProductSkeleton
                            key={`loading-skeleton-${index}`}
                          />
                        )
                      )}
                  </div>
                )}

                {/* =================================================
                    END OF PRODUCTS
                ================================================= */}

                {!hasNextPage && (
                  <div
                    className="
                      mt-12
                      text-center
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-medium
                        text-neutral-400
                      "
                    >
                      همه محصولات موجود
                      نمایش داده شدند.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
          FILTER PANEL
      =================================================== */}

      <FilterPanel
        mounted={filterMounted}
        active={filterActive}
        categories={categories}
        categoriesLoading={
          categoriesLoading
        }
        sort={sort}
        categoryId={categoryId}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onClose={closeFilters}
        onSortChange={selectSort}
        onCategoryChange={
          selectCategory
        }
        onMinPriceChange={
          setMinPrice
        }
        onMaxPriceChange={
          setMaxPrice
        }
        onApplyPrice={applyPrice}
        onClearFilters={
          clearFilters
        }
      />
    </main>
  );
}