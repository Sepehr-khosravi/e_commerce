"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CategorySkeleton from "./CategorySkeleton";
import { 
  ChevronLeft, 
  LayoutGrid
} from "lucide-react";

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
        const result = Array.isArray(data) ? data : data.categories ?? [];
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
    <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 lg:py-16">
      {/* Header */}
      <div className="flex items-center justify-center mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-neutral-300" />
          <span className="text-xs font-medium text-neutral-400 tracking-wider">
            دسته‌بندی
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <CategorySkeleton />
      ) : (
        <div
          ref={categoriesRef}
          dir="rtl"
          className="
            flex flex-nowrap items-start 
            justify-start md:justify-center 
            gap-6 sm:gap-10 md:gap-15
            overflow-x-auto pb-4
            scrollbar-none
            -mx-4 px-4
            md:mx-0 md:px-0
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* آیتم همه محصولات (اولین آیتم از راست) */}
          <Link
            href="/products"
            onClick={() => setActiveCategory("all")}
            className="group flex flex-col items-center justify-center shrink-0 gap-2"
          >
            <div
              className={`
                w-15 h-15 sm:w-15 sm:h-15 rounded-full border flex items-center justify-center bg-white
                transition-all duration-300
                ${
                  activeCategory === "all"
                    ? "border-neutral-900 shadow-lg shadow-neutral-200"
                    : "border-neutral-200 hover:border-neutral-400 group-hover:shadow-md"
                }
              `}
            >
              <LayoutGrid
                className={`
                  w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300
                  ${activeCategory === "all" ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-900"}
                `}
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-center leading-tight">
              همه محصولات
            </span>
          </Link>

          {/* دسته‌بندی‌های دیگر */}
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                onClick={() => setActiveCategory(category.slug)}
                className="group flex flex-col items-center justify-center shrink-0 gap-2"
              >
                <div
                  className={`
                    w-15 h-15 sm:w-15 sm:h-15 
                    rounded-full border flex items-center justify-center bg-white
                    transition-all duration-300
                    ${
                      isActive
                        ? "border-neutral-900 shadow-lg shadow-neutral-200"
                        : "border-neutral-200 hover:border-neutral-400 group-hover:shadow-md"
                    }
                  `}
                >
                  <LayoutGrid 
                    className={`
                      w-7 h-7 sm:w-8 sm:h-8
                      transition-all duration-300
                      ${isActive ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-900"}
                    `}
                    strokeWidth={1.5}
                  />
                </div>

                <span
                  className={`
                    text-[11px] sm:text-xs font-medium text-center leading-tight max-w-[80px]
                    ${isActive ? "text-neutral-900" : "text-neutral-600 group-hover:text-neutral-900"}
                  `}
                >
                  {category.name}
                </span>
              </Link>
            );
          })}

          {/* دکمه مشاهده بیشتر (آخرین آیتم - سمت چپ) */}
          <Link
            href="/products"
            onClick={() => setActiveCategory("all")}
            className="group flex flex-col items-center justify-center shrink-0 gap-2"
          >
            <div className="w-15 h-15 sm:w-15 sm:h-15 rounded-full border border-neutral-200 flex items-center justify-center bg-white transition-all duration-300 hover:border-neutral-400 group-hover:shadow-md">
              <ChevronLeft className="w-7 h-7 text-neutral-500 group-hover:text-black transition-colors" />
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-neutral-600 text-center">
              مشاهده بیشتر
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}