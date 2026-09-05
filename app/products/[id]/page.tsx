"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  Package,
  Truck,
  Heart,
} from "lucide-react";

import AddToCart from "@/components/products/AddToCart";
import RelatedProducts from "@/components/products/RelatedProducts";
import { normalizeImageUrl } from "@/app/lib/common/imageNormalizer";

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
  return new Intl.NumberFormat("fa-IR").format(Number(value));
}

function getFinalPrice(
  price: number,
  offer: number | null
) {
  if (
    offer === null ||
    offer <= 0 ||
    offer >= 100
  ) {
    return price;
  }

  return Math.round(
    price - (price * offer) / 100
  );
}

function getDiscountPercent(
  offer: number | null
) {
  if (
    offer === null ||
    offer <= 0 ||
    offer >= 100
  ) {
    return 0;
  }

  return Math.round(offer);
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

  /*
   * ============================================================
   * FAVORITES
   * ============================================================
   */

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const [favoriteChecked, setFavoriteChecked] =
    useState(false);

  /*
   * Load product
   */
  useEffect(() => {
    async function loadProduct() {
      try {
        const { id } = await params;

        if (!/^\d+$/.test(id)) {
          setError(
            "شناسه محصول نامعتبر است."
          );
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
            data.error ||
              "خطا در دریافت محصول"
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

  /*
   * ============================================================
   * LOAD FAVORITE STATUS
   * ============================================================
   *
   * GET /api/favorites
   *
   * We don't make the product page fail if the user
   * is not authenticated.
   */
  /*
   * ============================================================
   * LOAD FAVORITE STATUS
   * ============================================================
   *
   * GET /api/favorites/[productId]
   *
   * Only checks the current product instead of
   * downloading the user's entire favorites list.
   */
  useEffect(() => {
    async function loadFavoriteStatus() {
      try {
        const { id } = await params;
  
        if (!/^\d+$/.test(id)) {
          return;
        }
  
        const productId = Number(id);
  
        const response = await fetch(
          `/api/favorites/${productId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
  
        /*
         * Favorites require authentication.
         *
         * If the user is not authenticated,
         * don't make the product page fail.
         */
        if (!response.ok) {
          setIsFavorite(false);
          return;
        }
  
        const data: {
          favorite?: boolean;
        } = await response.json();
  
        setIsFavorite(data.favorite === true);
      } catch (error) {
        console.error(
          "Load favorite status error:",
          error
        );
  
        setIsFavorite(false);
      } finally {
        setFavoriteChecked(true);
      }
    }
  
    loadFavoriteStatus();
  }, [params]);

  /*
   * ============================================================
   * TOGGLE FAVORITE
   * ============================================================
   */
  async function toggleFavorite() {
    if (!product || favoriteLoading) {
      return;
    }
  
    try {
      setFavoriteLoading(true);
  
      if (!isFavorite) {
        const response = await fetch(
          "/api/favorites",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: product.id,
            }),
          }
        );
  
        if (!response.ok) {
          let message =
            "خطا در افزودن محصول به علاقه‌مندی‌ها";
  
          try {
            const data = await response.json();
  
            if (data?.error) {
              message = data.error;
            }
          } catch {
            // Response has no JSON body.
          }
  
          throw new Error(message);
        }
  
        setIsFavorite(true);
      } else {
        const response = await fetch(
          `/api/favorites/${product.id}`,
          {
            method: "DELETE",
          }
        );
  
        if (!response.ok) {
          let message =
            "خطا در حذف محصول از علاقه‌مندی‌ها";
  
          try {
            const data = await response.json();
  
            if (data?.error) {
              message = data.error;
            }
          } catch {
            // Response has no JSON body.
          }
  
          throw new Error(message);
        }
  
        setIsFavorite(false);
      }
    } catch (error) {
      console.error(
        "Toggle favorite error:",
        error
      );
  
      alert(
        error instanceof Error
          ? error.message
          : "خطایی در علاقه‌مندی‌ها رخ داد."
      );
    } finally {
      setFavoriteLoading(false);
    }
  }
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
    offer !== null &&
    offer > 0 &&
    offer < 100;

  const finalPrice = getFinalPrice(
    price,
    offer
  );

  const discount =
    getDiscountPercent(offer);

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

          {/* Images */}
          <ProductImageGallery
            images={product.images}
            title={product.title}
            isFeatured={product.isFeatured}
          />

          {/* Information */}
          <div className="flex flex-col justify-center">

            <div className="flex items-start justify-between gap-5">

              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Product
                </span>

                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl">
                  {product.title}
                </h1>
              </div>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={
                  favoriteLoading ||
                  !favoriteChecked
                }
                aria-label={
                  isFavorite
                    ? "حذف از علاقه‌مندی‌ها"
                    : "افزودن به علاقه‌مندی‌ها"
                }
                aria-pressed={isFavorite}
                className={`
                  group
                  mt-1
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  transition-all
                  duration-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  ${
                    isFavorite
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white text-black hover:border-black hover:bg-black hover:text-white"
                  }
                `}
              >
                <Heart
                  size={20}
                  strokeWidth={1.8}
                  fill={
                    isFavorite
                      ? "currentColor"
                      : "none"
                  }
                  className={`
                    transition-transform
                    duration-300
                    ${
                      favoriteLoading
                        ? "animate-pulse"
                        : "group-hover:scale-110"
                    }
                  `}
                />
              </button>

            </div>

            {/* Favorite Status */}
            {favoriteChecked && isFavorite && (
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-neutral-500">
                <Heart
                  size={13}
                  fill="currentColor"
                  className="text-black"
                />

                این محصول در علاقه‌مندی‌های شماست
              </div>
            )}

            {/* Price */}
            <div className="mt-8 border-y border-neutral-100 py-6">

              {hasOffer ? (
                <div className="flex flex-wrap items-center gap-3">

                  {/* Final Price */}
                  <span className="text-3xl font-bold text-black">
                    {formatPrice(finalPrice)}

                    <span className="mr-1 text-sm font-medium text-neutral-400">
                      تومان
                    </span>
                  </span>

                  {/* Original Price */}
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(price)}
                  </span>

                  {/* Discount */}
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

        {/* Related Products */}
        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />

      </div>
    </main>
  );
}

/*
 * ============================================================
 * PRODUCT GALLERY
 * ============================================================
 */

function ProductImageGallery({
  images,
  title,
  isFeatured,
}: {
  images: string[];
  title: string;
  isFeatured: boolean;
}) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [isDragging, setIsDragging] =
    useState(false);

  const startX = useRef(0);
  const currentX = useRef(0);
  const dragDistance = useRef(0);

  const hasImages = images.length > 0;
  const imageCount = images.length;

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  function goTo(index: number) {
    if (!imageCount) return;

    const nextIndex =
      (index + imageCount) % imageCount;

    setCurrentIndex(nextIndex);
  }

  function nextImage() {
    goTo(currentIndex + 1);
  }

  function previousImage() {
    goTo(currentIndex - 1);
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!hasImages || imageCount <= 1) return;

    startX.current = event.clientX;
    currentX.current = event.clientX;
    dragDistance.current = 0;

    setIsDragging(true);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!isDragging) return;

    currentX.current = event.clientX;

    dragDistance.current =
      currentX.current - startX.current;
  }

  function handlePointerUp() {
    if (!isDragging) return;

    setIsDragging(false);

    const distance = dragDistance.current;
    const threshold = 50;

    if (Math.abs(distance) >= threshold) {
      if (distance < 0) {
        nextImage();
      } else {
        previousImage();
      }
    }

    dragDistance.current = 0;
  }

  function handlePointerCancel() {
    setIsDragging(false);
    dragDistance.current = 0;
  }

  if (!hasImages) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-neutral-50">
        <div className="flex h-full items-center justify-center">
          <div className="h-40 w-40 animate-pulse rounded-[28px] bg-neutral-200 sm:h-56 sm:w-56" />
        </div>

        {isFeatured && (
          <span className="absolute right-5 top-5 rounded-full bg-black px-3 py-1.5 text-[10px] font-bold text-white">
            محصول منتخب
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div
        className={`
          relative
          aspect-square
          overflow-hidden
          rounded-[28px]
          bg-neutral-50
          select-none
          touch-pan-y
          ${
            isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }
        `}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <img
          key={`${currentIndex}-${images[currentIndex]}`}
          src={normalizeImageUrl(
            images[currentIndex]
          )}
          alt={`${title} - تصویر ${
            currentIndex + 1
          }`}
          draggable={false}
          className={`
            h-full
            w-full
            object-contain
            pointer-events-none
            ${
              isDragging
                ? ""
                : "animate-gallery-fade"
            }
          `}
        />

        {isFeatured && (
          <span className="absolute right-5 top-5 rounded-full bg-black px-3 py-1.5 text-[10px] font-bold text-white">
            محصول منتخب
          </span>
        )}

        {/* Left arrow */}
        {imageCount > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              previousImage();
            }}
            aria-label="تصویر قبلی"
            className="
              absolute
              left-4
              top-1/2
              flex
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white/90
              text-black
              shadow-sm
              backdrop-blur
              transition
              hover:bg-white
              active:scale-95
            "
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Right arrow */}
        {imageCount > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              nextImage();
            }}
            aria-label="تصویر بعدی"
            className="
              absolute
              right-4
              top-1/2
              flex
              h-10
              w-10
              -translate-y-1/2
              rotate-180
              items-center
              justify-center
              rounded-full
              bg-white/90
              text-black
              shadow-sm
              backdrop-blur
              transition
              hover:bg-white
              active:scale-95
            "
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {imageCount > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              className={`
                relative
                h-20
                w-20
                shrink-0
                overflow-hidden
                rounded-xl
                bg-neutral-50
                transition
                ${
                  index === currentIndex
                    ? "ring-2 ring-black ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }
              `}
            >
              <img
                src={normalizeImageUrl(image)}
                alt={`${title} - تصویر ${
                  index + 1
                }`}
                draggable={false}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots */}
      {imageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`رفتن به تصویر ${
                index + 1
              }`}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-300
                ${
                  index === currentIndex
                    ? "w-6 bg-black"
                    : "w-1.5 bg-neutral-300"
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
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