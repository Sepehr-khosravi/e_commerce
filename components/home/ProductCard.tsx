"use client";

import Link from "next/link";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import {
  Star,
  Package,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

type ProductCardProps = {
  product: Product;
};

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Math.round(Number(price))
  );
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { requireAuth } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const price = Number(product.price) || 0;

  // offer = درصد تخفیف
  const discountPercentage = Math.min(
    100,
    Math.max(0, Number(product.offer) || 0)
  );

  const hasOffer = discountPercentage > 0 && price > 0;

  // مبلغ تخفیف
  const discountAmount = hasOffer
    ? (price * discountPercentage) / 100
    : 0;

  // قیمت نهایی
  const finalPrice = hasOffer
    ? price - discountAmount
    : price;

  const hasImage =
    Array.isArray(product.images) &&
    product.images.length > 0 &&
    Boolean(product.images[0]);

  const handleFavorite = async (productId: number) => {
    if (favoriteLoading) return;

    const authenticated = await requireAuth();

    if (!authenticated) return;

    setFavoriteLoading(true);

    try {
      const response = isFavorite
        ? await fetch(`/api/favorites/${productId}`, {
            method: "DELETE",
            credentials: "include",
          })
        : await fetch(`/api/favorites/${productId}`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId,
            }),
          });

      if (response.status === 401) {
        await requireAuth();
        return;
      }

      if (!response.ok) {
        throw new Error("Favorite operation failed");
      }

      setIsFavorite((current) => !current);
    } catch (error) {
      console.error("Favorite error:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      aria-label={`مشاهده ${product.title}`}
      className="block h-full"
    >
      <article
        className="
          group
          flex
          h-full
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-neutral-100
          bg-white
          transition-all
          duration-300
          ease-out
          hover:-translate-y-1
          hover:border-neutral-200
          hover:shadow-xl
          hover:shadow-black/[0.05]
          sm:rounded-3xl
        "
      >
        {/* ================= IMAGE ================= */}

        <div
          className="
            relative
            h-[180px]
            w-full
            shrink-0
            overflow-hidden
            bg-neutral-50
            sm:h-[220px]
            md:h-[240px]
            lg:h-[260px]
          "
        >
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.title}
              loading="lazy"
              className="
                h-full
                w-full
                object-contain
                p-3
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.04]
                sm:p-5
              "
            />
          ) : (
            <Skeleton
              width="100%"
              height="100%"
              borderRadius={0}
            />
          )}

          {/* Image overlay */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/[0.03]
              via-transparent
              to-transparent
            "
          />

          {/* Featured */}

          {product.isFeatured && (
            <div
              className="
                absolute
                right-2.5
                top-2.5
                flex
                items-center
                gap-1
                rounded-full
                bg-black
                px-2.5
                py-1
                text-[9px]
                font-bold
                text-white
                shadow-sm
                sm:right-3
                sm:top-3
                sm:px-3
                sm:py-1.5
                sm:text-[10px]
              "
            >
              <Star
                size={10}
                fill="currentColor"
                strokeWidth={2.5}
              />

              ویژه
            </div>
          )}

          {/* Discount */}

          {hasOffer && (
            <div
              className="
                absolute
                left-2.5
                top-2.5
                rounded-full
                bg-white
                px-2.5
                py-1
                text-[9px]
                font-bold
                text-black
                shadow-sm
                sm:left-3
                sm:top-3
                sm:px-3
                sm:py-1.5
                sm:text-[10px]
              "
            >
              {formatPrice(discountPercentage)}٪ تخفیف
            </div>
          )}
        </div>

        {/* ================= CONTENT ================= */}

        <div
          className="
            flex
            flex-1
            flex-col
            px-3
            py-3
            sm:px-5
            sm:py-5
            lg:px-6
            lg:py-5
          "
        >
          {/* Category */}

          <div className="min-h-[16px]">
            {product.category?.name && (
              <p
                className="
                  text-[9px]
                  font-semibold
                  text-neutral-400
                  sm:text-[10px]
                  md:text-[11px]
                "
              >
                {product.category.name}
              </p>
            )}
          </div>

          {/* Title */}

          <h3
            className="
              mt-1
              line-clamp-2
              min-h-[40px]
              text-[12px]
              font-bold
              leading-5
              text-black
              transition-colors
              duration-200
              group-hover:text-neutral-500
              sm:min-h-[48px]
              sm:text-sm
              sm:leading-6
              md:text-base
              lg:text-lg
            "
          >
            {product.title}
          </h3>

          {/* Stock */}

          <div
            className="
              mt-2
              flex
              min-h-[17px]
              items-center
              gap-1
              text-[9px]
              font-medium
              text-neutral-400
              sm:mt-3
              sm:gap-1.5
              sm:text-[10px]
              md:text-[11px]
            "
          >
            <Package
              size={11}
              className="shrink-0 sm:h-[13px] sm:w-[13px]"
            />

            {product.count > 0 ? (
              <span>
                {formatPrice(product.count)} عدد موجود
              </span>
            ) : (
              <span className="text-neutral-500">
                ناموجود
              </span>
            )}
          </div>

          {/* Price */}

          <div
            className="
              mt-auto
              flex
              items-end
              justify-between
              gap-2
              pt-3
              sm:pt-4
            "
          >
            <div className="min-w-0">
              {/* Old Price */}

              {hasOffer ? (
                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    sm:gap-2
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-medium
                      text-neutral-400
                      line-through
                      sm:text-xs
                    "
                  >
                    {formatPrice(price)}
                  </p>

                  <span
                    className="
                      rounded-md
                      bg-neutral-100
                      px-1
                      py-0.5
                      text-[8px]
                      font-bold
                      text-neutral-500
                      sm:text-[9px]
                    "
                  >
                    {formatPrice(discountPercentage)}٪
                  </span>
                </div>
              ) : (
                <div className="h-[15px]" />
              )}

              {/* Final Price */}

              <div
                className="
                  mt-0.5
                  flex
                  items-baseline
                  gap-1
                  sm:mt-1
                "
              >
                <span
                  className="
                    text-sm
                    font-extrabold
                    tracking-tight
                    text-black
                    sm:text-lg
                    md:text-xl
                  "
                >
                  {formatPrice(finalPrice)}
                </span>

                <span
                  className="
                    text-[8px]
                    font-semibold
                    text-neutral-400
                    sm:text-[10px]
                  "
                >
                  تومان
                </span>
              </div>
            </div>

            {/* Arrow */}

            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-neutral-100
                transition-all
                duration-300
                group-hover:bg-black
                group-hover:text-white
                sm:h-9
                sm:w-9
              "
            >
              <ArrowLeft
                size={13}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-0.5
                  sm:h-4
                  sm:w-4
                "
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
