import {
  ArrowRight,
  CalendarDays,
  Hash,
} from "lucide-react";

type Props = {
  orderId: number;
  createdAt: string;
};

export default function OrderHeader({
  orderId,
  createdAt,
}: Props) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

      <div>
        <button
          onClick={() =>
            window.location.href = "/dashboard/orders"
          }
          className="mb-5 flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-black"
        >
          <ArrowRight size={17} />
          سفارش‌های من
        </button>

        <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
          جزئیات سفارش
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-500">

          <span className="flex items-center gap-2">
            <Hash size={15} />
            سفارش #{orderId}
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

          <span className="flex items-center gap-2">
            <CalendarDays size={15} />
            {createdAt}
          </span>

        </div>
      </div>

    </div>
  );
}