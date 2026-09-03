// components/home/popular-products.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ChevronLeft, ChevronRight, Star, Package } from "lucide-react";

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

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Math.round(Number(price)));
}

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products/popular?limit=15");
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const data = await response.json();
        setProducts(data.products);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت محصولات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto bg-white rounded-[0_14px_14px_0] md:rounded-[14px] p-3 md:p-4 border border-neutral-200">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 md:h-6 bg-red-500 rounded-full" />
            <Skeleton width={160} height={24} />
            <Skeleton width={20} height={20} />
          </div>
          <div className="hidden md:flex gap-1.5">
            <Skeleton width={32} height={32} circle />
            <Skeleton width={32} height={32} circle />
          </div>
        </div>
        <div className="flex gap-2.5 md:gap-3 overflow-hidden">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="min-w-[120px] md:min-w-[160px] flex-shrink-0"
            >
              <div className="bg-neutral-50 rounded-lg overflow-hidden">
                <Skeleton height={120} className="md:h-[160px]" />
                <div className="p-2 md:p-3">
                  <Skeleton count={2} />
                  <Skeleton width={80} height={20} className="mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1200px] mx-auto bg-white rounded-[0_14px_14px_0] md:rounded-[14px] p-4 text-center border border-neutral-200">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white rounded-[0_14px_14px_0] md:rounded-[14px] p-3 md:p-4 border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 md:h-6 bg-red-500 rounded-full" />
          <h2 className="text-sm md:text-lg font-bold text-black">
            کالاهای بسیار محبوب
          </h2>
          <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400" />
        </div>
        
        <div className="hidden md:flex gap-1.5">
          <button
            onClick={() => scroll('right')}
            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Products Scroll */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2.5 md:gap-3 overflow-x-auto scroll-smooth pb-1 hide-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product) => (
          <PopularProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden justify-center gap-2.5 mt-3">
        <button
          onClick={() => scroll('right')}
          className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-black" />
        </button>
        <button
          onClick={() => scroll('left')}
          className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 text-black" />
        </button>
      </div>
    </div>
  );
}

function PopularProductCard({ product }: { product: Product }) {
  const price = Number(product.price) || 0;
  const discountPercentage = Math.min(100, Math.max(0, Number(product.offer) || 0));
  const hasOffer = discountPercentage > 0 && price > 0;
  const discountAmount = hasOffer ? (price * discountPercentage) / 100 : 0;
  const finalPrice = hasOffer ? price - discountAmount : price;
  
  const hasImage = Array.isArray(product.images) && product.images.length > 0 && Boolean(product.images[0]);

  return (
    <Link
      href={`/products/${product.id}`}
      className="min-w-[120px] max-w-[120px] md:min-w-[160px] md:max-w-[160px] flex-shrink-0 group"
    >
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 border border-neutral-200 hover:border-black">
        {/* Image */}
        <div className="relative aspect-square bg-neutral-50">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.title}
              loading="lazy"
              className="w-full h-full object-contain p-2 md:p-3 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-neutral-300" />
            </div>
          )}

          {/* Discount Badge */}
          {hasOffer && (
            <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded">
              {formatPrice(discountPercentage)}%
            </div>
          )}

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute top-1.5 left-1.5 bg-black text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Star className="w-2 h-2 md:w-2.5 md:h-2.5" fill="currentColor" />
              ویژه
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2 md:p-3">
          {/* Category */}
          {product.category?.name && (
            <p className="text-[7px] md:text-[9px] text-neutral-400 font-medium mb-0.5">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="text-[9px] md:text-[11px] text-black line-clamp-2 min-h-[20px] md:min-h-[28px] leading-tight mb-1 group-hover:text-neutral-600 transition-colors">
            {product.title}
          </h3>

          {/* Stock */}
          <div className="flex items-center gap-1 text-[7px] md:text-[9px] text-neutral-400 mb-1">
            <Package className="w-2 h-2 md:w-2.5 md:h-2.5" />
            <span>{product.count > 0 ? `${formatPrice(product.count)} عدد` : 'ناموجود'}</span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between gap-1">
            <div>
              {hasOffer && (
                <div className="text-[7px] md:text-[9px] text-neutral-400 line-through">
                  {formatPrice(price)}
                </div>
              )}
              <div className="flex items-baseline gap-0.5">
                <span className="text-[10px] md:text-sm font-bold text-black">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-[6px] md:text-[8px] text-neutral-400">تومان</span>
              </div>
            </div>
            
            <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-neutral-100 group-hover:bg-black transition-colors flex items-center justify-center flex-shrink-0">
              <ChevronLeft className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}