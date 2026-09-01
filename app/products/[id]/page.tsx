"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  Package,
  Truck,
} from "lucide-react";

import AddToCart from "@/components/products/AddToCart";
import RelatedProducts from "@/components/products/RelatedProducts";

type Product = {
  id: number;
  title: string;
  slug: string;
  price: number | string;
  offer: number | string | null;
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

type ProductResponse = {
  product: Product;
};

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Number(value)
  );
}

function getDiscount(price: number, offer: number) {
  if (offer >= price) return 0;

  return Math.round(
    ((price - offer) / price) * 100
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { id } = await params;

        if (!/^\d+$/.test(id)) {
          setError("شناسه محصول نامعتبر است.");
          return;
        }

        const response = await fetch(
          `/api/products/${id}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "خطا در دریافت محصول"
          );
        }

        const result: ProductResponse = data;

        setProduct(result.product);
      } catch (error) {
        console.error(
          "Product page error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی رخ داده است."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params]);

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (error || !product) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-white px-5"
      >
        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <Package
              size={24}
              className="text-neutral-400"
            />
          </div>

          <h1 className="mt-5 text-xl font-bold text-black">
            {error || "محصول پیدا نشد"}
          </h1>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            بازگشت به محصولات
            <ArrowRight size={15} />
          </Link>

        </div>
      </main>
    );
  }

  const price = Number(product.price);

  const offer =
    product.offer !== null
      ? Number(product.offer)
      : null;

  const hasOffer =
    offer !== null && offer < price;

  const discount = hasOffer
    ? getDiscount(price, offer!)
    : 0;

  const available = product.count > 0;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs text-neutral-400">

          <Link
            href="/"
            className="transition hover:text-black"
          >
            خانه
          </Link>

          <ChevronLeft size={13} />

          <Link
            href="/products"
            className="transition hover:text-black"
          >
            محصولات
          </Link>

          <ChevronLeft size={13} />

          <span className="max-w-48 truncate text-neutral-600">
            {product.title}
          </span>

        </div>

        {/* Main Product */}
        <section className="grid gap-8 lg:grid-cols-2 lg:gap-14">

          {/* Image */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-neutral-50">

              {product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-40 w-40 animate-pulse rounded-[28px] bg-neutral-200 sm:h-56 sm:w-56" />
                </div>
              )}

              {product.isFeatured && (
                <span className="absolute right-5 top-5 rounded-full bg-black px-3 py-1.5 text-[10px] font-bold text-white">
                  محصول منتخب
                </span>
              )}

            </div>
          </div>

          {/* Information */}
          <div className="flex flex-col justify-center">

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Product
            </span>

            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-8 border-y border-neutral-100 py-6">

              {hasOffer ? (
                <div className="flex flex-wrap items-center gap-3">

                  <span className="text-3xl font-bold text-black">
                    {formatPrice(offer!)}
                    <span className="mr-1 text-sm font-medium text-neutral-400">
                      تومان
                    </span>
                  </span>

                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(price)}
                  </span>

                  <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-bold text-white">
                    {discount}٪ تخفیف
                  </span>

                </div>
              ) : (
                <span className="text-3xl font-bold text-black">
                  {formatPrice(price)}

                  <span className="mr-1 text-sm font-medium text-neutral-400">
                    تومان
                  </span>
                </span>
              )}

            </div>

            {/* Stock */}
            <div className="mt-5 flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3">

                <span
                  className={`h-2 w-2 rounded-full ${
                    available
                      ? "bg-black"
                      : "bg-neutral-300"
                  }`}
                />

                <span className="text-xs font-semibold text-neutral-600">
                  {available
                    ? `موجود — ${formatPrice(
                        product.count
                      )} عدد`
                    : "ناموجود"}
                </span>

              </div>

              <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3">

                <Truck
                  size={14}
                  className="text-neutral-400"
                />

                <span className="text-xs font-semibold text-neutral-600">
                  ارسال سریع
                </span>

              </div>

            </div>

            {/* Add to cart */}
            <div className="mt-5">
              <AddToCart
                productId={product.id}
                productCount={product.count}
              />
            </div>

            {/* Info Cards */}
            <div className="mt-7 grid grid-cols-2 gap-3">

              <InfoCard
                icon={<Package size={16} />}
                title="محصول اصلی"
                description="تضمین کیفیت"
              />

              <InfoCard
                icon={<Truck size={16} />}
                title="ارسال سریع"
                description="تحویل در کوتاه‌ترین زمان"
              />

            </div>

          </div>

        </section>

        {/* Description */}
        <section className="mt-16 border-t border-neutral-100 pt-10">

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Details
          </span>

          <h2 className="mt-2 text-xl font-bold text-black">
            درباره محصول
          </h2>

          <p className="mt-5 max-w-4xl whitespace-pre-line text-sm leading-8 text-neutral-500">
            {product.description}
          </p>

        </section>

        {/* ================================================= */}
        {/* RELATED PRODUCTS                                  */}
        {/* ================================================= */}

        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />

      </div>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 p-4">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-black">
        {icon}
      </div>

      <h3 className="mt-3 text-xs font-bold text-black">
        {title}
      </h3>

      <p className="mt-1 text-[10px] text-neutral-400">
        {description}
      </p>

    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">

        <div className="h-4 w-48 animate-pulse rounded bg-neutral-100" />

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14">

          <div className="aspect-square animate-pulse rounded-[28px] bg-neutral-100" />

          <div className="flex flex-col justify-center">

            <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />

            <div className="mt-5 h-12 w-4/5 animate-pulse rounded-xl bg-neutral-100" />

            <div className="mt-3 h-12 w-3/5 animate-pulse rounded-xl bg-neutral-100" />

            <div className="mt-7 space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
            </div>

            <div className="mt-8 h-20 animate-pulse rounded-xl bg-neutral-100" />

            <div className="mt-5 h-12 animate-pulse rounded-xl bg-neutral-100" />

            <div className="mt-7 h-14 animate-pulse rounded-2xl bg-neutral-100" />

          </div>

        </div>

      </div>
    </main>
  );
}