import { ReceiptText } from "lucide-react";

import type { OrderItem } from "@/app/dashboard/orders/[id]/page";

type Props = {
  totalPrice: number | string;
  items: OrderItem[];
  formatPrice: (value: number | string) => string;
};

function roundMoney(value: number) {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}

export default function OrderSummary({
  totalPrice,
  items,
  formatPrice,
}: Props) {
  const subtotal = items.reduce(
    (sum, item) => {
      const price =
        Number(item.productPrice);

      const quantity =
        Number(item.quantity);

      return (
        sum +
        price * quantity
      );
    },
    0
  );

  const finalTotal =
    Number(totalPrice);

  const discount =
    roundMoney(
      subtotal - finalTotal
    );

  return (
    <aside className="h-fit lg:sticky lg:top-6">

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f1] text-[#FF5858]">
            <ReceiptText size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-black">
              خلاصه پرداخت
            </h2>

            <p className="mt-0.5 text-xs text-neutral-400">
              جزئیات مبلغ سفارش
            </p>
          </div>

        </div>

        <div className="mt-6 space-y-4">

          <div className="flex justify-between text-sm">

            <span className="text-neutral-500">
              مبلغ کالاها
            </span>

            <span className="font-semibold text-black">
              {formatPrice(
                subtotal
              )}{" "}
              تومان
            </span>

          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">

              <span className="text-neutral-500">
                تخفیف
              </span>

              <span className="font-semibold text-green-600">
                - {formatPrice(
                  discount
                )}{" "}
                تومان
              </span>

            </div>
          )}

          <div className="border-t border-dashed border-neutral-200 pt-4">

            <div className="flex items-end justify-between">

              <span className="text-sm font-bold text-black">
                مبلغ نهایی
              </span>

              <div className="text-left">

                <span className="text-xl font-black text-black">
                  {formatPrice(
                    finalTotal
                  )}
                </span>

                <span className="mr-1 text-xs text-neutral-400">
                  تومان
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}