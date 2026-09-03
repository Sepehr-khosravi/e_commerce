"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CategorySkeleton from "./CategorySkeleton";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        const result = Array.isArray(data)
          ? data
          : data.categories ?? [];

        setCategories(result);
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section
      id="categories"
      className="
        mx-auto
        w-full
        max-w-7xl
        px-3
        py-8
        sm:px-5
        sm:py-10
        md:px-6
        md:py-12
        lg:px-8
        lg:py-16
      "
    >
      {/* Header */}
      <div
        className="
          mb-5
          flex
          items-end
          justify-between
          gap-4
          sm:mb-7
          md:mb-8
        "
      >
        <div className="text-right">
          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-neutral-400
              sm:text-[10px]
              sm:tracking-[0.25em]
            "
          >
            Categories
          </span>

          <h2
            className="
              mt-1.5
              text-lg
              font-bold
              tracking-tight
              text-black
              sm:mt-2
              sm:text-2xl
              md:text-3xl
            "
          >
            دسته‌بندی محصولات
          </h2>

          <p
            className="
              mt-1.5
              max-w-xl
              text-[11px]
              leading-5
              text-neutral-500
              sm:mt-2
              sm:text-xs
              md:text-sm
              md:leading-6
            "
          >
            محصولات مورد نظرتان را سریع‌تر پیدا کنید.
          </p>
        </div>

        {/* All products */}
        <Link
          href="/products"
          onClick={() => setActiveCategory("all")}
          className="
            shrink-0
            text-[10px]
            font-semibold
            text-neutral-500
            transition-colors
            hover:text-black
            sm:text-xs
            md:text-sm
          "
        >
          مشاهده همه
          <span className="mr-1">←</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <CategorySkeleton />
      ) : (
        <div
          ref={categoriesRef}
          dir="rtl"
          className="
            -mx-3
            flex
            gap-2
            overflow-x-auto
            px-3
            pb-2
            scrollbar-none
            sm:-mx-5
            sm:gap-2.5
            sm:px-5
            md:mx-0
            md:flex-wrap
            md:justify-start
            md:overflow-visible
            md:px-0
            md:pb-0
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* All */}
          <Link
            href="/products"
            onClick={() => setActiveCategory("all")}
            className={`
              group
              flex
              h-10
              shrink-0
              items-center
              gap-2
              rounded-xl
              px-4
              text-[11px]
              font-bold
              transition-all
              duration-200
              sm:h-11
              sm:px-5
              sm:text-xs
              md:h-12
              md:rounded-2xl
              md:px-6
              md:text-sm
              ${
                activeCategory === "all"
                  ? "bg-black text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black"
              }
            `}
          >
            <span
              className={`
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-md
                text-[9px]
                transition-colors
                sm:h-6
                sm:w-6
                sm:text-[10px]
                ${
                  activeCategory === "all"
                    ? "bg-white/15 text-white"
                    : "bg-white text-neutral-500"
                }
              `}
            >
              ✦
            </span>

            همه محصولات
          </Link>

          {/* Categories */}
          {categories.map((category) => {
            const isActive =
              activeCategory === category.slug;

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(
                  category.slug
                )}`}
                onClick={() =>
                  setActiveCategory(category.slug)
                }
                className={`
                  group
                  flex
                  h-10
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  px-4
                  text-[11px]
                  font-semibold
                  transition-all
                  duration-200
                  sm:h-11
                  sm:px-5
                  sm:text-xs
                  md:h-12
                  md:rounded-2xl
                  md:px-6
                  md:text-sm
                  ${
                    isActive
                      ? "bg-black text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black"
                  }
                `}
              >
                <span
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? "bg-white"
                        : "bg-neutral-400 group-hover:bg-black"
                    }
                  `}
                />

                {category.name}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
