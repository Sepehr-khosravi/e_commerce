import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Product = {
  price: number | string;
  offer?: number | string | null;
};

type CartItem = {
  quantity: number;
  product: Product;
};

type Props = {
  items: CartItem[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    value
  );
}

export default function CartSummary({
  items,
}: Props) {
  const originalTotal = items.reduce(
    (total, item) =>
      total +
      Number(item.product.price) *
        item.quantity,
    0
  );

  const finalTotal = items.reduce(
    (total, item) => {
      const price = Number(
        item.product.price
      );

      const offer =
        item.product.offer !== null &&
        item.product.offer !== undefined
          ? Number(item.product.offer)
          : null;

      const finalPrice =
        offer !== null && offer > 0
          ? offer
          : price;

      return (
        total +
        finalPrice * item.quantity
      );
    },
    0
  );

  const discount =
    originalTotal - finalTotal;

  return (
    <aside className="sticky top-6 rounded-3xl bg-neutral-50 p-5 sm:p-6">

      <div className="mb-6">

        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Order Summary
        </span>

        <h2 className="mt-2 text-lg font-bold text-black">
          خلاصه سفارش
        </h2>

      </div>


      <div className="space-y-4 text-xs">

        <div className="flex items-center justify-between">

          <span className="text-neutral-500">
            قیمت محصولات
          </span>

          <span className="font-semibold text-black">
            {formatPrice(
              originalTotal
            )}{" "}
            تومان
          </span>

        </div>


        {discount > 0 && (
          <div className="flex items-center justify-between">

            <span className="text-neutral-500">
              تخفیف
            </span>

            <span className="font-semibold text-black">
              −{" "}
              {formatPrice(discount)}{" "}
              تومان
            </span>

          </div>
        )}

      </div>


      <div className="my-6 h-px bg-neutral-200" />


      <div className="flex items-end justify-between">

        <span className="text-xs font-medium text-neutral-500">
          مبلغ نهایی
        </span>

        <div className="text-left">

          <p className="text-xl font-bold tracking-tight text-black">
            {formatPrice(finalTotal)}
          </p>

          <p className="mt-1 text-[9px] text-neutral-400">
            تومان
          </p>

        </div>

      </div>


      <Link
        href="/checkout"
        className="mt-7 flex h-12 items-center justify-center gap-2 rounded-xl bg-black text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg"
      >
        ادامه و ثبت سفارش
        <ArrowLeft size={15} />
      </Link>


      <Link
        href="/products"
        className="mt-3 flex h-11 items-center justify-center rounded-xl text-xs font-semibold text-neutral-500 transition hover:bg-white hover:text-black"
      >
        ادامه خرید
      </Link>

    </aside>
  );
}