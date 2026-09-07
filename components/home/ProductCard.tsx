"use client";

import Link from "next/link";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Star, Package, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeImageUrl } from "@/app/lib/common/imageNormalizer";

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
  category?: { id: number; name: string; slug: string } | null;
};

type ProductCardProps = {
  product: Product;
};

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Math.round(Number(price)));
}

export default function ProductCard({ product }: ProductCardProps) {
  const { requireAuth } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const price = Number(product.price) || 0;
  const discountPercentage = Math.min(100, Math.max(0, Number(product.offer) || 0));
  const hasOffer = discountPercentage > 0 && price > 0;
  const finalPrice = hasOffer ? price - (price * discountPercentage) / 100 : price;

  const hasImage = Array.isArray(product.images) && product.images.length > 0 && Boolean(product.images[0]);

  const handleFavorite = async () => {
    if (favoriteLoading) return;
    const authenticated = await requireAuth();
    if (!authenticated) return;

    setFavoriteLoading(true);
    try {
      const response = isFavorite
        ? await fetch(`/api/favorites/${product.id}`, { method: "DELETE", credentials: "include" })
        : await fetch(`/api/favorites/${product.id}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          });

      if (response.status === 401) {
        await requireAuth();
        return;
      }
      if (!response.ok) throw new Error("Favorite operation failed");

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
      className="block h-full group"
    >
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md hover:shadow-black/[0.04]">
        
        {/* ===== IMAGE ===== */}
        <div className="relative h-[120px] w-full shrink-0 overflow-hidden bg-neutral-50 sm:h-[140px] md:h-[160px] lg:h-[180px]">
          {hasImage ? (
            <img
              src={normalizeImageUrl(product.images[0])}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.05] sm:p-3"
            />
          ) : (
            <Skeleton width="100%" height="100%" borderRadius={0} />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.03] via-transparent to-transparent" />

          {product.isFeatured && (
            <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-black px-2 py-0.5 text-[8px] font-bold text-white shadow-sm sm:text-[9px]">
              <Star size={8} fill="currentColor" strokeWidth={2.5} />
              ویژه
            </div>
          )}

          {hasOffer && (
            <div className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[8px] font-bold text-black shadow-sm sm:text-[9px]">
              {formatPrice(discountPercentage)}٪ تخفیف
            </div>
          )}
        </div>

        {/* ===== CONTENT ===== */}
        <div className="flex flex-1 flex-col px-2.5 py-2.5 sm:px-3 sm:py-3">
          <div className="min-h-[11px]">
            {product.category?.name && (
              <p className="text-[8px] font-semibold text-neutral-400 sm:text-[9px]">
                {product.category.name}
              </p>
            )}
          </div>

          <h3 className="mt-1 line-clamp-2 min-h-[30px] text-[11px] font-bold leading-4 text-black transition-colors duration-200 group-hover:text-neutral-500 sm:min-h-[34px] sm:text-xs sm:leading-5">
            {product.title}
          </h3>

          <div className="mt-1.5 flex min-h-[13px] items-center gap-1 text-[8px] font-medium text-neutral-400 sm:text-[9px]">
            <Package size={9} className="shrink-0 sm:h-[11px] sm:w-[11px]" />
            {product.count > 0 ? (
              <span>{formatPrice(product.count)} عدد موجود</span>
            ) : (
              <span className="text-neutral-500">ناموجود</span>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-1 pt-2">
            <div className="min-w-0">
              {hasOffer ? (
                <div className="flex items-center gap-1">
                  <p className="text-[8px] font-medium text-neutral-400 line-through sm:text-[9px]">
                    {formatPrice(price)}
                  </p>
                  <span className="rounded bg-neutral-100 px-1 py-0.5 text-[7px] font-bold text-neutral-500 sm:text-[8px]">
                    {formatPrice(discountPercentage)}٪
                  </span>
                </div>
              ) : (
                <div className="h-[10px]" />
              )}

              <div className="mt-0.5 flex items-baseline gap-0.5">
                <span className="text-xs font-extrabold tracking-tight text-black sm:text-sm">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-[7px] font-semibold text-neutral-400 sm:text-[8px]">
                  تومان
                </span>
              </div>
            </div>

            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-all duration-300 group-hover:bg-black group-hover:text-white sm:h-6 sm:w-6">
              <ArrowLeft size={10} className="transition-transform duration-300 group-hover:-translate-x-0.5 sm:h-3 sm:w-3" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}