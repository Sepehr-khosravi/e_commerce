"use client";

import { useState } from "react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import {
  Star,
  Package,
  ArrowLeft,
  Heart,
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
  return new Intl.NumberFormat("fa-IR").format(Number(price));
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const hasImage =
    Array.isArray(product.images) &&
    product.images.length > 0;

  const hasOffer =
    product.offer !== null &&
    product.offer !== undefined &&
    Number(product.offer) > 0;

  const finalPrice = hasOffer
    ? Number(product.offer)
    : Number(product.price);

  const discountPercentage = hasOffer
    ? Math.round(
        ((Number(product.price) - Number(product.offer)) /
          Number(product.price)) *
          100
      )
    : 0;

  const { requireAuth } = useAuth();

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const handleFavorite = async (productId: number) => {
    if (favoriteLoading) return;

    const authenticated = await requireAuth();

    if (!authenticated) {
      return;
    }

    setFavoriteLoading(true);

    try {
      const response = isFavorite
        ? await fetch(
            `/api/favorites/${productId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          )
        : await fetch(
            `/api/favorites/${productId}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId,
              }),
            }
          );

      if (response.status === 401) {
        await requireAuth();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Favorite operation failed"
        );
      }

      setIsFavorite((current) => !current);
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      aria-label={`مشاهده ${product.title}`}
    >
      <article
        className="
          group
          overflow-hidden
          rounded-3xl
          border
          border-neutral-100
          bg-white
          transition-all
          duration-300
          ease-out
          hover:-translate-y-1
          hover:border-neutral-200
          hover:shadow-xl
          hover:shadow-black/[0.04]
        "
      >
        {/* ================= IMAGE ================= */}

        <div className="relative">
          {/* {hasImage ? ( */}
          { product.images.length ? ( 
            <img
              src={product.images[0]}
              alt={product.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                ease-out
                group-hover:scale-105
              "
            />
          ) : (
            <Skeleton 
              width="100%"
              height="200px"
              borderRadius={0}
            />
          )}

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
                font-semibold
                text-white
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
              />

              ویژه
            </div>
          )}

          {/* Discount */}
          {discountPercentage > 0 && (
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
              {discountPercentage}% تخفیف
            </div>
          )}

          {/* Favorite */}

          {/* 
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              handleFavorite(product.id);
            }}
            disabled={favoriteLoading}
            aria-label={
              isFavorite
                ? "حذف از علاقه‌مندی‌ها"
                : "افزودن به علاقه‌مندی‌ها"
            }
            className={`
              absolute
              bottom-3
              right-3
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              backdrop-blur-md
              transition-all
              duration-300
              ease-out
              active:scale-90
              disabled:cursor-wait
              ${
                isFavorite
                  ? "bg-black text-white"
                  : "bg-white/90 text-neutral-600 hover:bg-black hover:text-white"
              }
            `}
          >
            <Heart
              size={17}
              strokeWidth={2}
              fill={
                isFavorite
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
          */}
        </div>

        {/* ================= CONTENT ================= */}

        <div
          className="
            px-3.5
            py-3.5
            sm:p-5
            lg:p-6
          "
        >
          {/* Category */}

          {product.category?.name && (
            <p
              className="
                mb-1
                text-[10px]
                font-semibold
                text-neutral-400
                sm:mb-1.5
                sm:text-[11px]
              "
            >
              {product.category.name}
            </p>
          )}

          {/* Title */}

          <h3
            className="
              line-clamp-2
              text-sm
              font-bold
              leading-5.5
              text-black
              transition-colors
              duration-200
              group-hover:text-neutral-500
              sm:min-h-[48px]
              sm:text-base
              sm:leading-6
              lg:text-lg
              lg:leading-7
            "
          >
            {product.title}
          </h3>

          {/* Stock */}

          <div
            className="
              mt-2.5
              flex
              items-center
              gap-1
              text-[10px]
              font-medium
              text-neutral-400
              sm:mt-3
              sm:gap-1.5
              sm:text-[11px]
            "
          >
            <Package
              size={12}
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
              mt-3
              flex
              items-end
              justify-between
              gap-2
              sm:mt-4
              sm:gap-3
            "
          >
            <div>
              {/* Old Price */}

              {hasOffer && (
                <p
                  className="
                    text-[10px]
                    font-medium
                    text-neutral-400
                    line-through
                    sm:text-xs
                  "
                >
                  {formatPrice(product.price)}
                </p>
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
                    text-base
                    font-bold
                    text-black
                    sm:text-lg
                    lg:text-xl
                  "
                >
                  {formatPrice(finalPrice)}
                </span>

                <span
                  className="
                    text-[9px]
                    font-semibold
                    text-neutral-400
                    sm:text-[10px]
                  "
                >
                  تومان
                </span>
              </div>
            </div>

            {/* Details */}

            <ArrowLeft
              size={15}
              className="
                shrink-0
                transition-transform
                duration-300
                group-hover:-translate-x-0.5
                sm:h-[17px]
                sm:w-[17px]
              "
            />
          </div>
        </div>
      </article>
    </Link>
  );
}