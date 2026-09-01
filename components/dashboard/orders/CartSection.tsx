import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export default function CartSection() {
  return (
    <div className="rounded-3xl bg-neutral-50 p-6 sm:p-8">

      <div className="flex flex-col items-center justify-center py-10 text-center">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
          <ShoppingCart
            size={24}
            className="text-neutral-400"
          />
        </div>

        <h3 className="mt-5 text-sm font-bold text-black">
          سبد خرید
        </h3>

        <p className="mt-2 max-w-sm text-xs leading-6 text-neutral-400">
          محصولات انتخابی شما پس از اتصال
          سرویس سبد خرید در این قسمت نمایش
          داده خواهند شد.
        </p>

        <Link
          href="/products"
          className="mt-5 flex h-11 items-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white transition hover:bg-neutral-800"
        >
          رفتن به فروشگاه
          <ArrowLeft size={14} />
        </Link>

      </div>

    </div>
  );
}