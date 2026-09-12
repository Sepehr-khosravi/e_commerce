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

type ProductVariant = {
  id: number;
  color: string | null;
  count: number;
  isActive: boolean;
};

type Product = {
  id: number;
  title: string;
  slug: string;
  price: number | string;
  offer: number | string | null;
  images: string[];
  description: string;

  // Kept optional for backward compatibility.
  count?: number;

  variants: ProductVariant[];

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

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const [favoriteChecked, setFavoriteChecked] =
    useState(false);

  /*
   * ============================================================
   * SELECTED VARIANT
   * ============================================================
   */

  const [selectedVariantId, setSelectedVariantId] =
    useState<number | null>(null);

  /*
   * ============================================================
   * LOAD PRODUCT
   * ============================================================
   */

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
            data.error ||
              "خطا در دریافت محصول"
          );
        }

        const result: ProductResponse = data;

        const loadedProduct = {
          ...result.product,
          variants:
            result.product.variants ?? [],
        };

        setProduct(loadedProduct);

        /*
         * Select the first available colored variant.
         *
         * For products without colors, selectedVariantId
         * remains null.
         */
        const firstAvailableVariant =
          loadedProduct.variants.find(
            (variant) =>
              variant.isActive &&
              variant.count > 0 &&
              variant.color !== null
          );

        setSelectedVariantId(
          firstAvailableVariant?.id ?? null
        );
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

        if (!response.ok) {
          setIsFavorite(false);
          return;
        }

        const data: {
          favorite?: boolean;
        } = await response.json();

        setIsFavorite(
          data.favorite === true
        );
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
            const data =
              await response.json();

            if (data?.error) {
              message = data.error;
            }
          } catch {
            // No JSON response.
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
            const data =
              await response.json();

            if (data?.error) {
              message = data.error;
            }
          } catch {
            // No JSON response.
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

  /*
   * ============================================================
   * STATES
   * ============================================================
   */

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (error || !product) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-white px-5"
      >
        <div className="w-full max-w-md text-center">
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

  /*
   * ============================================================
   * VARIANTS / STOCK
   * ============================================================
   */

  const variants =
    product.variants ?? [];

  const colorVariants =
    variants.filter(
      (variant) =>
        variant.isActive &&
        variant.color !== null
    );

  const hasColors =
    colorVariants.length > 0;

  const selectedVariant =
    variants.find(
      (variant) =>
        variant.id === selectedVariantId
    ) ?? null;

  /*
   * Total stock is only used for products
   * without colors.
   */
  const totalStock = variants.length
    ? variants.reduce(
        (total, variant) =>
          total +
          (variant.isActive
            ? variant.count
            : 0),
        0
      )
    : Number(product.count ?? 0);

  /*
   * Stock belonging to the currently
   * selected variant.
   */
  const selectedVariantStock =
    selectedVariant?.isActive
      ? selectedVariant.count
      : 0;

  /*
   * Stock that AddToCart should use.
   */
  const productCount = hasColors
    ? selectedVariantStock
    : totalStock;

  /*
   * There is at least one purchasable
   * variant somewhere in the product.
   */
  const hasAnyStock = hasColors
    ? colorVariants.some(
        (variant) =>
          variant.count > 0
      )
    : totalStock > 0;

  /*
   * User has to select a color before
   * purchasing a colored product.
   */
  const requiresVariantSelection =
    hasColors &&
    selectedVariantId === null;

  /*
   * Product can actually be added
   * to cart right now.
   */
  const available =
    !requiresVariantSelection &&
    productCount > 0;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <main
      dir="rtl"
      className={`
        min-h-screen
        bg-white
        ${
          hasAnyStock
            ? "pb-28 lg:pb-0"
            : ""
        }
      `}
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* ======================================================
            BREADCRUMB
        ====================================================== */}

        <div className="mb-6 flex items-center gap-1.5 overflow-hidden text-[11px] text-neutral-400 sm:mb-8 sm:gap-2 sm:text-xs">
          <Link
            href="/"
            className="shrink-0 transition hover:text-black"
          >
            خانه
          </Link>

          <ChevronLeft
            size={13}
            className="shrink-0"
          />

          <Link
            href="/products"
            className="shrink-0 transition hover:text-black"
          >
            محصولات
          </Link>

          <ChevronLeft
            size={13}
            className="shrink-0"
          />

          <span className="min-w-0 truncate text-neutral-600">
            {product.title}
          </span>
        </div>

        {/* ======================================================
            PRODUCT
        ====================================================== */}

        <section className="grid gap-7 sm:gap-10 lg:grid-cols-2 lg:gap-14">

          {/* ====================================================
              IMAGE GALLERY
          ==================================================== */}

          <ProductImageGallery
            images={product.images}
            title={product.title}
            isFeatured={product.isFeatured}
          />

          {/* ====================================================
              INFORMATION
          ==================================================== */}

          <div className="flex min-w-0 flex-col justify-center">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0 flex-1">

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 sm:text-xs">
                  Product
                </span>

                <h1 className="mt-2 text-2xl font-bold leading-[1.35] tracking-tight text-black sm:text-3xl lg:text-4xl xl:text-5xl">
                  {product.title}
                </h1>

              </div>

              {/* Favorite */}
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
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  transition-all
                  duration-200
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:h-12
                  sm:w-12
                  ${
                    isFavorite
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white text-black hover:border-black"
                  }
                `}
              >
                <Heart
                  size={19}
                  strokeWidth={1.8}
                  fill={
                    isFavorite
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    favoriteLoading
                      ? "animate-pulse"
                      : ""
                  }
                />
              </button>
            </div>

            {/* Favorite status */}
            {favoriteChecked &&
              isFavorite && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-500">
                  <Heart
                    size={13}
                    fill="currentColor"
                    className="text-black"
                  />

                  این محصول در علاقه‌مندی‌های شماست
                </div>
              )}

            {/* ==================================================
                PRICE
            ================================================== */}

            <div className="mt-6 border-y border-neutral-100 py-5 sm:mt-8 sm:py-6">

              {hasOffer ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">

                  <span className="text-2xl font-bold text-black sm:text-3xl">
                    {formatPrice(finalPrice)}

                    <span className="mr-1 text-xs font-medium text-neutral-400 sm:text-sm">
                      تومان
                    </span>
                  </span>

                  <span className="text-xs text-neutral-400 line-through sm:text-sm">
                    {formatPrice(price)}
                  </span>

                  <span className="rounded-full bg-black px-2.5 py-1 text-[9px] font-bold text-white sm:text-[10px]">
                    {discount}٪ تخفیف
                  </span>

                </div>
              ) : (
                <span className="text-2xl font-bold text-black sm:text-3xl">
                  {formatPrice(price)}

                  <span className="mr-1 text-xs font-medium text-neutral-400 sm:text-sm">
                    تومان
                  </span>
                </span>
              )}

            </div>

            {hasColors && (
  <div className="mt-6">
    <div className="mb-3 text-xs font-semibold text-neutral-700">
      انتخاب رنگ
    </div>

    <div className="flex flex-wrap items-center gap-3">
      {colorVariants.map((variant) => {
        const isSelected =
          selectedVariantId === variant.id;

        const isOutOfStock =
          variant.count <= 0;

        return (
          <button
            key={variant.id}
            type="button"
            disabled={isOutOfStock}
            onClick={() =>
              setSelectedVariantId(variant.id)
            }
            aria-label={`انتخاب رنگ ${variant.color}`}
            aria-pressed={isSelected}
            className={`
              group
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              transition-all
              duration-200
              disabled:cursor-not-allowed
              ${
                isSelected
                  ? "scale-110"
                  : "hover:scale-105"
              }
              ${
                isOutOfStock
                  ? "opacity-30"
                  : ""
              }
            `}
          >
            {/* حلقه انتخاب */}
            <span
              className={`
                absolute
                inset-0
                rounded-full
                border
                transition-all
                duration-200
                ${
                  isSelected
                    ? "border-black"
                    : "border-neutral-200 group-hover:border-neutral-400"
                }
              `}
            />

            {/* خود رنگ */}
            <span
              className="
                h-7
                w-7
                rounded-full
                border
                border-black/10
                shadow-sm
                transition-transform
                duration-200
              "
              style={{
                backgroundColor:
                  variant.color ?? "#ffffff",
              }}
            />

            {/* خط روی رنگ ناموجود */}
            {isOutOfStock && (
              <span
                className="
                  absolute
                  left-1/2
                  top-1/2
                  h-px
                  w-8
                  -translate-x-1/2
                  -translate-y-1/2
                  rotate-45
                  bg-neutral-500
                "
              />
            )}
          </button>
        );
      })}
    </div>
  </div>
)}

            {/* ==================================================
                STOCK + SHIPPING
            ================================================== */}

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">

              <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-3 sm:px-4">

                <span
                  className={`
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    ${
                      available
                        ? "bg-black"
                        : "bg-neutral-300"
                    }
                  `}
                />

                <span className="truncate text-[10px] font-semibold text-neutral-600 sm:text-xs">

                  {hasColors
                    ? requiresVariantSelection
                      ? "لطفاً رنگ را انتخاب کنید"
                      : selectedVariantStock > 0
                        ? `موجود — ${formatPrice(
                            selectedVariantStock
                          )} عدد`
                        : "ناموجود"
                    : totalStock > 0
                      ? `موجود — ${formatPrice(
                          totalStock
                        )} عدد`
                      : "ناموجود"}

                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-3 sm:px-4">

                <Truck
                  size={14}
                  className="shrink-0 text-neutral-400"
                />

                <span className="truncate text-[10px] font-semibold text-neutral-600 sm:text-xs">
                  ارسال سریع
                </span>

              </div>

            </div>

            {/* ==================================================
                DESKTOP ADD TO CART
            ================================================== */}

            <div className="mt-5 hidden lg:block">

              <AddToCart
                productId={product.id}
                productCount={productCount}
                variantId={
                  hasColors
                    ? selectedVariantId
                    : null
                }
                requiresVariant={
                  hasColors
                }
              />

            </div>

            {/* ==================================================
                INFO CARDS
            ================================================== */}

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-3">

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

        {/* ======================================================
            DESCRIPTION
        ====================================================== */}

        <section className="mt-12 border-t border-neutral-100 pt-8 sm:mt-16 sm:pt-10">

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 sm:text-xs">
            Details
          </span>

          <h2 className="mt-2 text-lg font-bold text-black sm:text-xl">
            درباره محصول
          </h2>

          <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-neutral-500 sm:mt-5 sm:leading-8">
            {product.description}
          </p>

        </section>

        {/* ======================================================
            RELATED PRODUCTS
        ====================================================== */}

        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />
      </div>

      {/* ========================================================
          MOBILE FIXED ADD TO CART
          ======================================================== */}

      {hasAnyStock && (
        <div
          className="
            fixed
            inset-x-0
            bottom-0
            z-[100]
            border-t
            border-neutral-200
            bg-white/95
            px-3
            pt-3
            shadow-[0_-10px_35px_-20px_rgba(0,0,0,0.3)]
            backdrop-blur-xl
            lg:hidden
          "
          style={{
            paddingBottom:
              "calc(0.75rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="mx-auto flex w-full max-w-2xl items-center gap-3">

            {/* Price */}
            <div className="min-w-0 shrink-0">

              <p className="text-[9px] font-medium text-neutral-400">
                قیمت نهایی
              </p>

              <div className="mt-0.5 flex items-baseline gap-1">

                <span className="text-base font-black text-black sm:text-lg">
                  {formatPrice(finalPrice)}
                </span>

                <span className="text-[9px] font-medium text-neutral-400">
                  تومان
                </span>

              </div>

            </div>

            {/* Cart */}
            <div className="min-w-0 flex-1">

              <AddToCart
                productId={product.id}
                productCount={productCount}
                variantId={
                  hasColors
                    ? selectedVariantId
                    : null
                }
                requiresVariant={
                  hasColors
                }
              />

            </div>

          </div>
        </div>
      )}
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
    if (
      !hasImages ||
      imageCount <= 1
    ) {
      return;
    }

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
      currentX.current -
      startX.current;
  }

  function handlePointerUp() {
    if (!isDragging) return;

    setIsDragging(false);

    const distance =
      dragDistance.current;

    const threshold = 50;

    if (
      Math.abs(distance) >= threshold
    ) {
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
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-50 sm:rounded-[28px]">
        <div className="flex h-full items-center justify-center">
          <div className="h-32 w-32 animate-pulse rounded-2xl bg-neutral-200 sm:h-56 sm:w-56 sm:rounded-[28px]" />
        </div>

        {isFeatured && (
          <span className="absolute right-4 top-4 rounded-full bg-black px-3 py-1.5 text-[9px] font-bold text-white sm:right-5 sm:top-5 sm:text-[10px]">
            محصول منتخب
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0">

      {/* Main image */}
      <div
        className={`
          relative
          aspect-square
          overflow-hidden
          rounded-2xl
          bg-neutral-50
          select-none
          touch-pan-y
          sm:rounded-[28px]
          ${
            isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }
        `}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={
          handlePointerCancel
        }
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

        {/* Featured */}
        {isFeatured && (
          <span className="absolute right-4 top-4 rounded-full bg-black px-3 py-1.5 text-[9px] font-bold text-white sm:right-5 sm:top-5 sm:text-[10px]">
            محصول منتخب
          </span>
        )}

        {/* Arrows */}
        {imageCount > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousImage();
              }}
              aria-label="تصویر قبلی"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-sm backdrop-blur transition hover:bg-white active:scale-95 sm:left-4 sm:h-10 sm:w-10"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              aria-label="تصویر بعدی"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 rotate-180 items-center justify-center rounded-full bg-white/90 text-black shadow-sm backdrop-blur transition hover:bg-white active:scale-95 sm:right-4 sm:h-10 sm:w-10"
            >
              <ChevronLeft size={17} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imageCount > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 sm:mt-4 sm:gap-3">
          {images.map(
            (image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() =>
                  goTo(index)
                }
                className={`
                  relative
                  h-16
                  w-16
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  bg-neutral-50
                  transition
                  sm:h-20
                  sm:w-20
                  ${
                    index ===
                    currentIndex
                      ? "ring-2 ring-black ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }
                `}
              >
                <img
                  src={normalizeImageUrl(
                    image
                  )}
                  alt={`${title} - تصویر ${
                    index + 1
                  }`}
                  draggable={false}
                  className="h-full w-full object-contain"
                />
              </button>
            )
          )}
        </div>
      )}

      {/* Dots */}
      {imageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5 sm:mt-4">
          {images.map(
            (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  goTo(index)
                }
                aria-label={`رفتن به تصویر ${
                  index + 1
                }`}
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    index ===
                    currentIndex
                      ? "w-6 bg-black"
                      : "w-1.5 bg-neutral-300"
                  }
                `}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

/*
 * ============================================================
 * INFO CARD
 * ============================================================
 */

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
    <div className="rounded-2xl border border-neutral-100 p-3.5 sm:p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-black sm:h-9 sm:w-9">
        {icon}
      </div>

      <h3 className="mt-2.5 text-[11px] font-bold text-black sm:mt-3 sm:text-xs">
        {title}
      </h3>

      <p className="mt-1 text-[9px] leading-4 text-neutral-400 sm:text-[10px]">
        {description}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * SKELETON
 * ============================================================
 */

function ProductPageSkeleton() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        <div className="h-3 w-40 animate-pulse rounded bg-neutral-100 sm:h-4 sm:w-48" />

        <div className="mt-6 grid gap-7 sm:mt-8 sm:gap-10 lg:grid-cols-2 lg:gap-14">

          <div className="aspect-square animate-pulse rounded-2xl bg-neutral-100 sm:rounded-[28px]" />

          <div className="flex flex-col justify-center">

            <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />

            <div className="mt-4 h-9 w-4/5 animate-pulse rounded-xl bg-neutral-100 sm:h-12" />

            <div className="mt-3 h-9 w-3/5 animate-pulse rounded-xl bg-neutral-100 sm:h-12" />

            <div className="mt-6 space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
            </div>

            <div className="mt-7 h-16 animate-pulse rounded-xl bg-neutral-100" />

            <div className="mt-5 h-12 animate-pulse rounded-xl bg-neutral-100" />

            <div className="mt-6 h-14 animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        </div>
      </div>
    </main>
  );
}