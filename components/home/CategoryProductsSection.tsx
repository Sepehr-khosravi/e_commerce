// components/home/CategoryProductsSection.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Star } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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

type CategoryWithProducts = Category & {
  products: Product[];
};

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Math.round(Number(price)));
}

export default function CategoryProductsSection() {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // دریافت کتگوری‌ها
        const categoriesRes = await fetch("/api/categories");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesRes.json();
        const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.categories ?? [];

        // دریافت محصولات محبوب
        const productsRes = await fetch("/api/products/popular?limit=50");
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productsRes.json();
        const products = productsData.products || [];

        // گروه‌بندی محصولات بر اساس کتگوری
        const categoriesMap = new Map<number, CategoryWithProducts>();
        
        categories.forEach((cat: Category) => {
          categoriesMap.set(cat.id, {
            ...cat,
            products: []
          });
        });

        products.forEach((product: Product) => {
          if (product.category && categoriesMap.has(product.category.id)) {
            const cat = categoriesMap.get(product.category.id)!;
            cat.products.push(product);
          }
        });

        // فقط کتگوری‌هایی که محصول دارند رو نگه دار
        const result = Array.from(categoriesMap.values())
          .filter(cat => cat.products.length > 0);

        setCategoriesWithProducts(result);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت اطلاعات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton width={200} height={32} />
          <Skeleton width={100} height={20} />
        </div>
        
        <div className="space-y-8">
          {[...Array(3)].map((_, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-4">
                <Skeleton width={150} height={24} />
                <Skeleton width={80} height={20} />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                    <Skeleton height={180} />
                    <div className="p-3">
                      <Skeleton count={2} />
                      <Skeleton width={80} height={20} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 py-8 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (categoriesWithProducts.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 py-8 text-center">
        <p className="text-neutral-500">هیچ دسته‌بندی با محصول وجود ندارد</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-5 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
          دسته‌بندی محصولات
        </h2>
        <Link
          href="/products"
          className="text-sm font-semibold text-black hover:text-neutral-600 transition-colors"
        >
          مشاهده همه ←
        </Link>
      </div>

      {/* Categories with Products */}
      <div className="space-y-8">
        {categoriesWithProducts.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryRow({ category }: { category: CategoryWithProducts }) {
  // فقط 3 محصول اول رو نمایش بده
  const displayProducts = category.products.slice(0, 3);

  return (
    <div>
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-black sm:text-lg">
          {category.name}
        </h3>
        <Link
          href={`/products?category=${encodeURIComponent(category.slug)}`}
          className="text-xs font-medium text-neutral-500 hover:text-black transition-colors"
        >
          مشاهده همه {category.products.length}+
        </Link>
      </div>

      {/* Products Grid - دقیقاً مثل ProductSection */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
        {displayProducts.map((product) => (
          <CategoryProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function CategoryProductCard({ product }: { product: Product }) {
  const price = Number(product.price) || 0;
  const discountPercentage = Math.min(100, Math.max(0, Number(product.offer) || 0));
  const hasOffer = discountPercentage > 0 && price > 0;
  const discountAmount = hasOffer ? (price * discountPercentage) / 100 : 0;
  const finalPrice = hasOffer ? price - discountAmount : price;
  
  const hasImage = Array.isArray(product.images) && product.images.length > 0 && Boolean(product.images[0]);

  return (
    <Link
      href={`/products/${product.id}`}
      className="block h-full group"
    >
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-200 hover:shadow-xl hover:shadow-black/[0.05] sm:rounded-3xl">
        {/* Image */}
        <div className="relative h-[180px] w-full shrink-0 overflow-hidden bg-neutral-50 sm:h-[220px] md:h-[240px] lg:h-[260px]">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.04] sm:p-5"
            />
          ) : (
            <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
              <Package className="w-10 h-10 text-neutral-300" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.03] via-transparent to-transparent" />

          {product.isFeatured && (
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[9px] font-bold text-white shadow-sm sm:right-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[10px]">
              <Star size={10} fill="currentColor" strokeWidth={2.5} />
              ویژه
            </div>
          )}

          {hasOffer && (
            <div className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-black shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[10px]">
              {formatPrice(discountPercentage)}٪ تخفیف
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
          <div className="min-h-[16px]">
            {product.category?.name && (
              <p className="text-[9px] font-semibold text-neutral-400 sm:text-[10px] md:text-[11px]">
                {product.category.name}
              </p>
            )}
          </div>

          <h3 className="mt-1 line-clamp-2 min-h-[40px] text-[12px] font-bold leading-5 text-black transition-colors duration-200 group-hover:text-neutral-500 sm:min-h-[48px] sm:text-sm sm:leading-6 md:text-base lg:text-lg">
            {product.title}
          </h3>

          <div className="mt-2 flex min-h-[17px] items-center gap-1 text-[9px] font-medium text-neutral-400 sm:mt-3 sm:gap-1.5 sm:text-[10px] md:text-[11px]">
            <Package size={11} className="shrink-0 sm:h-[13px] sm:w-[13px]" />
            {product.count > 0 ? (
              <span>{formatPrice(product.count)} عدد موجود</span>
            ) : (
              <span className="text-neutral-500">ناموجود</span>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3 sm:pt-4">
            <div className="min-w-0">
              {hasOffer ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <p className="text-[9px] font-medium text-neutral-400 line-through sm:text-xs">
                    {formatPrice(price)}
                  </p>
                  <span className="rounded-md bg-neutral-100 px-1 py-0.5 text-[8px] font-bold text-neutral-500 sm:text-[9px]">
                    {formatPrice(discountPercentage)}٪
                  </span>
                </div>
              ) : (
                <div className="h-[15px]" />
              )}

              <div className="mt-0.5 flex items-baseline gap-1 sm:mt-1">
                <span className="text-sm font-extrabold tracking-tight text-black sm:text-lg md:text-xl">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-[8px] font-semibold text-neutral-400 sm:text-[10px]">
                  تومان
                </span>
              </div>
            </div>

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-all duration-300 group-hover:bg-black group-hover:text-white sm:h-9 sm:w-9">
              <svg
                className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5 sm:h-4 sm:w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}