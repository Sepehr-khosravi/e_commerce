"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type SearchFiltersProps = {
  categories: {
    id: number;
    name: string;
  }[];
};

const sortOptions = [
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
  {
    value: "popular",
    label: "محبوب‌ترین",
  },
];

export default function SearchFilters({
  categories,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const currentSort =
    searchParams.get("sort") || "newest";

  const currentCategory =
    searchParams.get("categoryId") || "";

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") || ""
  );

  const updateFilters = (
    key: string,
    value: string
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // وقتی فیلتر عوض می‌شود
    // pagination باید از اول شروع شود.
    params.delete("cursor");

    router.push(
      `/search?${params.toString()}`
    );
  };

  const applyPrice = () => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    params.delete("cursor");

    router.push(
      `/search?${params.toString()}`
    );
  };

  const clearFilters = () => {
    const params = new URLSearchParams();

    const query = searchParams.get("q");

    if (query) {
      params.set("q", query);
    }

    params.set("sort", "newest");

    setMinPrice("");
    setMaxPrice("");

    router.push(
      `/search?${params.toString()}`
    );
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden items-center justify-between gap-4 border-b border-neutral-100 pb-5 md:flex">

        <div className="flex items-center gap-2">

          <div className="flex h-10 items-center gap-2 rounded-xl bg-neutral-100 px-3 text-xs font-semibold text-neutral-500">
            <SlidersHorizontal size={15} />
            فیلترها
          </div>

          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                updateFilters(
                  "sort",
                  option.value
                )
              }
              className={`
                rounded-xl px-4 py-2.5
                text-xs font-semibold
                transition-all duration-300
                ${
                  currentSort ===
                  option.value
                    ? "bg-black text-white shadow-sm"
                    : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-black"
                }
              `}
            >
              {option.label}
            </button>
          ))}

        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-xl bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
        >
          فیلتر بیشتر
        </button>

      </div>

      {/* Mobile */}
      <div className="flex items-center justify-between md:hidden">

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white"
        >
          <SlidersHorizontal size={15} />
          فیلتر و مرتب‌سازی
        </button>

        <span className="text-xs text-neutral-400">
          {sortOptions.find(
            (item) =>
              item.value === currentSort
          )?.label}
        </span>

      </div>

      {/* Advanced filters */}
      {open && (
        <div className="mt-4 rounded-3xl border border-neutral-100 bg-neutral-50 p-5">

          <div className="mb-5 flex items-center justify-between">

            <h3 className="text-sm font-bold text-black">
              فیلتر محصولات
            </h3>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-500 transition hover:bg-black hover:text-white"
            >
              <X size={15} />
            </button>

          </div>

          {/* Sort */}
          <div>
            <p className="mb-3 text-xs font-semibold text-neutral-500">
              مرتب‌سازی
            </p>

            <div className="flex flex-wrap gap-2">
              {sortOptions.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateFilters(
                        "sort",
                        option.value
                      )
                    }
                    className={`
                      rounded-xl px-4 py-2.5
                      text-xs font-semibold
                      transition-all
                      ${
                        currentSort ===
                        option.value
                          ? "bg-black text-white"
                          : "bg-white text-neutral-500 hover:text-black"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="mt-6">

              <p className="mb-3 text-xs font-semibold text-neutral-500">
                دسته‌بندی
              </p>

              <select
                value={currentCategory}
                onChange={(e) =>
                  updateFilters(
                    "categoryId",
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border-0 bg-white px-4 text-sm text-black outline-none focus:ring-0"
              >
                <option value="">
                  همه دسته‌بندی‌ها
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>

            </div>
          )}

          {/* Price */}
          <div className="mt-6">

            <p className="mb-3 text-xs font-semibold text-neutral-500">
              محدوده قیمت
            </p>

            <div className="grid grid-cols-2 gap-3">

              <input
                type="number"
                inputMode="numeric"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(
                    e.target.value
                  )
                }
                placeholder="حداقل قیمت"
                className="h-11 rounded-xl border-0 bg-white px-4 text-sm outline-none ring-0 transition focus:ring-2 focus:ring-black/5"
              />

              <input
                type="number"
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value
                  )
                }
                placeholder="حداکثر قیمت"
                className="h-11 rounded-xl border-0 bg-white px-4 text-sm outline-none ring-0 transition focus:ring-2 focus:ring-black/5"
              />

            </div>

            <button
              type="button"
              onClick={applyPrice}
              className="mt-3 h-11 w-full rounded-xl bg-black text-xs font-bold text-white transition hover:bg-neutral-800"
            >
              اعمال محدوده قیمت
            </button>

          </div>

          {/* Clear */}
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 w-full text-xs font-semibold text-neutral-400 transition hover:text-black"
          >
            پاک کردن فیلترها
          </button>

        </div>
      )}
    </>
  );
}