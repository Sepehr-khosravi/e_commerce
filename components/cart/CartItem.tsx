"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

type Product = {
  id: number;
  title: string;
  slug: string;
  price: number | string;
  offer?: number | string | null;
  images: string[];
  count: number;
  isActive: boolean;
};

type ProductVariant = {
  id: number;
  productId: number;
  color: string | null;
  count: number;
  isActive: boolean;
};

type CartItemType = {
  id: number;
  quantity: number;
  productId: number;
  variantId: number | null;
  product: Product;
  variant: ProductVariant | null;
};

type Props = {
  item: CartItemType;
  onRemove: (id: number) => Promise<void>;
  onUpdateQuantity: (
    id: number,
    quantity: number
  ) => Promise<void>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    Math.round(value)
  );
}

export default function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: Props) {
  const product = item.product;
  const variant = item.variant;

  const price = Number(product.price);

  const offer =
    product.offer !== null &&
    product.offer !== undefined
      ? Number(product.offer)
      : 0;

  const discount = Math.min(
    Math.max(offer, 0),
    100
  );

  const finalPrice =
    price * (1 - discount / 100);

  const totalPrice =
    finalPrice * item.quantity;

  const hasOffer =
    Number.isFinite(offer) &&
    offer > 0 &&
    offer < price;

  const image = product.images?.[0];

  // Variant stock is authoritative when this cart item
  // belongs to a specific variant.
  const maxQuantity = Math.max(
    variant
      ? variant.count
      : product.count,
    1
  );

  const hasColor =
    variant?.color !== null &&
    variant?.color !== undefined;

  return (
    <article className="group rounded-3xl border border-neutral-100 bg-white p-4 transition-all duration-300 hover:border-neutral-200 hover:shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="flex gap-4">

        {/* Image */}

        <Link
          href={`/products/${product.id}`}
          className="shrink-0"
        >
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 sm:h-28 sm:w-28">
            {image ? (
              <img
                src={image}
                alt={product.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-200" />
            )}
          </div>
        </Link>

        {/* Content */}

        <div className="flex min-w-0 flex-1 flex-col">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <Link
                href={`/products/${product.id}`}
                className="line-clamp-2 text-sm font-bold text-black transition hover:text-neutral-500"
              >
                {product.title}
              </Link>

              {/* Selected color */}

              {hasColor && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-medium text-neutral-400">
                    رنگ
                  </span>

                  <span
                    className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                    style={{
                      backgroundColor:
                        variant.color ?? "#ffffff",
                    }}
                    aria-label={`رنگ انتخاب‌شده ${variant.color}`}
                  />
                </div>
              )}

              {/* Original price */}

              {hasOffer && (
                <p className="mt-1 text-[10px] text-neutral-400 line-through">
                  {formatPrice(price)} تومان
                </p>
              )}

            </div>

            <button
              type="button"
              onClick={() =>
                onRemove(item.id)
              }
              aria-label="حذف محصول"
              className="shrink-0 rounded-lg p-2 text-neutral-300 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>

          </div>

          <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              {/* Total */}

              <p className="text-sm font-bold text-black">
                {formatPrice(totalPrice)}{" "}
                <span className="text-[9px] font-medium text-neutral-400">
                  تومان
                </span>
              </p>

              {/* Unit price */}

              {item.quantity > 1 && (
                <p className="mt-1 text-[10px] text-neutral-400">
                  {formatPrice(finalPrice)} تومان ×{" "}
                  {formatPrice(item.quantity)}
                </p>
              )}

            </div>

            {/* Quantity */}

            <div className="flex h-9 w-fit items-center rounded-xl bg-neutral-50">

              <button
                type="button"
                disabled={item.quantity <= 1}
                onClick={() =>
                  onUpdateQuantity(
                    item.id,
                    item.quantity - 1
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-200 disabled:opacity-30"
              >
                <Minus size={13} />
              </button>

              <span className="w-8 text-center text-xs font-bold text-black">
                {new Intl.NumberFormat(
                  "fa-IR"
                ).format(item.quantity)}
              </span>

              <button
                type="button"
                disabled={
                  item.quantity >= maxQuantity ||
                  !variant?.isActive &&
                  item.variantId !== null
                }
                onClick={() =>
                  onUpdateQuantity(
                    item.id,
                    item.quantity + 1
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-200 disabled:opacity-30"
              >
                <Plus size={13} />
              </button>

            </div>

          </div>

        </div>

      </div>
    </article>
  );
}
