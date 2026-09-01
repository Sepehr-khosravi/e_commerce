"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
} from "lucide-react";

type Product = {
  id: number;
  title: string;
  slug: string;
  price: number | string;
  offer?: number | string | null;
  images: string[];
  count: number;
  purchaseCount: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: number;
};

type ProductsResponse = {
  products: Product[];
  nextCursor: number | null;
  hasNextPage: boolean;
};

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Number(value)
  );
}

export default function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: number;
  currentProductId: number;
}) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRelatedProducts() {
      setLoading(true);
      setError(false);

      try {
        const params = new URLSearchParams();

        params.set(
          "categoryId",
          String(categoryId)
        );

        params.set("limit", "8");
        params.set("sort", "newest");

        const response = await fetch(
          `/api/products?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch related products"
          );
        }

        const data: ProductsResponse =
          await response.json();

        if (cancelled) return;

        const relatedProducts =
          (data.products ?? []).filter(
            (product) =>
              product.id !== currentProductId
          );

        setProducts(relatedProducts);
      } catch (error) {
        console.error(
          "Related products error:",
          error
        );

        if (!cancelled) {
          setError(true);
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRelatedProducts();

    return () => {
      cancelled = true;
    };
  }, [categoryId, currentProductId]);

  return (
    <section
      dir="rtl"
      className="mt-20 border-t border-neutral-100 pt-12"
    >

      {/* Header */}
      <div className="mb-7 flex items-end justify-between gap-4">

        <div>

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Related
          </span>

          <h2 className="mt-2 text-xl font-bold text-black sm:text-2xl">
            محصولات مرتبط
          </h2>

          <p className="mt-2 text-sm text-neutral-400">
            محصولات دیگری از همین دسته
          </p>

        </div>

        {!loading && products.length > 0 && (
          <Link
            href={`/products?categoryId=${categoryId}`}
            className="hidden items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-black sm:flex"
          >
            مشاهده همه

            <ArrowLeft size={14} />
          </Link>
        )}

      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">

          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="animate-pulse"
              >

                <div className="aspect-square rounded-2xl bg-neutral-100" />

                <div className="mt-3 h-4 w-4/5 rounded bg-neutral-100" />

                <div className="mt-2 h-4 w-2/5 rounded bg-neutral-100" />

              </div>
            )
          )}

        </div>
      )}

      {/* Error / Empty */}
      {!loading &&
        (error || products.length === 0) && (
          <div className="rounded-2xl bg-neutral-50 px-5 py-12 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white">

              <Package
                size={21}
                className="text-neutral-300"
              />

            </div>

            <h3 className="mt-4 text-sm font-bold text-black">
              محصول مرتبطی پیدا نشد
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              در حال حاضر محصول دیگری از این دسته وجود ندارد.
            </p>

          </div>
        )}

      {/* Products */}
      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">

            {products.map((product) => {
              const price = Number(
                product.price
              );

              const offer =
                product.offer !== null &&
                product.offer !== undefined
                  ? Number(product.offer)
                  : null;

              const hasOffer =
                offer !== null &&
                offer < price;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group"
                >

                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-50">

                    {product.images?.length > 0 ? (
                      <img
                        src={
                          product.images[0]
                        }
                        alt={
                          product.title
                        }
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package
                          size={28}
                          className="text-neutral-300"
                        />
                      </div>
                    )}

                    {product.isFeatured && (
                      <span className="absolute right-3 top-3 rounded-full bg-black px-2.5 py-1 text-[9px] font-bold text-white">
                        منتخب
                      </span>
                    )}

                    {hasOffer && (
                      <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-black shadow-sm">
                        تخفیف
                      </span>
                    )}

                  </div>

                  {/* Info */}
                  <div className="mt-2 px-1">

                    <h3 className="line-clamp-1 text-sm font-semibold text-black transition-colors group-hover:text-neutral-500">
                      {product.title}
                    </h3>

                    <div className="mt-1.5">

                      {hasOffer ? (
                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-sm font-bold text-black">
                            {formatPrice(
                              offer!
                            )}

                            <span className="mr-1 text-[9px] font-medium text-neutral-400">
                              تومان
                            </span>
                          </span>

                          <span className="text-[10px] text-neutral-400 line-through">
                            {formatPrice(
                              price
                            )}
                          </span>

                        </div>
                      ) : (
                        <span className="text-sm font-bold text-black">
                          {formatPrice(
                            price
                          )}

                          <span className="mr-1 text-[9px] font-medium text-neutral-400">
                            تومان
                          </span>
                        </span>
                      )}

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>

          {/* Mobile */}
          <Link
            href={`/products?categoryId=${categoryId}`}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-neutral-50 py-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-black sm:hidden"
          >
            مشاهده همه محصولات این دسته

            <ArrowLeft size={14} />
          </Link>
        </>
      )}

    </section>
  );
}