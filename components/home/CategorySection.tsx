"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        // Supports both:
        // [...]
        // { categories: [...] }
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
      className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Explore
        </span>

        <h2 className="mt-2 text-2xl font-bold text-black sm:text-3xl">
          دسته‌بندی محصولات
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500">
          محصول مورد نظرتان را از میان دسته‌بندی‌های مختلف پیدا کنید.
        </p>
      </div>

      {loading ? (
        <CategorySkeleton />
      ) : (
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link
            href="/products"
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-out ${
              activeCategory === "all"
                ? "bg-black text-white shadow-md shadow-black/10"
                : "bg-neutral-100 text-neutral-600 hover:-translate-y-0.5 hover:bg-neutral-200 hover:text-black"
            }`}
          >
            همه
          </Link>

          {categories.map((category) => {
            const isActive = activeCategory === category.slug;

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(
                  category.slug
                )}`}
                onClick={() => setActiveCategory(category.slug)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-out ${
                  isActive
                    ? "bg-black text-white shadow-md shadow-black/10"
                    : "bg-neutral-100 text-neutral-600 hover:-translate-y-0.5 hover:bg-neutral-200 hover:text-black"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}