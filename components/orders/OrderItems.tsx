import { Package } from "lucide-react";

import type { OrderItem } from "@/app/dashboard/orders/[id]/page";

type Props = {
  items: OrderItem[];
  formatPrice: (value: number | string) => string;
};

function roundMoney(value: number) {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}

export default function OrderItems({
  items,
  formatPrice,
}: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">

      <div className="border-b border-neutral-100 px-6 py-5">
        <h2 className="text-base font-bold text-black">
          محصولات سفارش
        </h2>

        <p className="mt-1 text-xs text-neutral-400">
          {formatPrice(
            items.reduce(
              (sum, item) =>
                sum + item.quantity,
              0
            )
          )}{" "}
          کالا
        </p>
      </div>

      <div className="divide-y divide-neutral-100">

        {items.map((item) => {
          const basePrice =
            Number(item.productPrice);

          const offer =
            Number(item.productOffer);

          const finalUnitPrice =
            roundMoney(
              basePrice *
                (1 -
                  offer / 100)
            );

          const lineTotal =
            Number(item.totalPrice);

          return (
            <div
              key={item.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5 lg:p-6"
            >
              <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-50 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Package
                    size={19}
                    className="text-neutral-300 sm:size-[21px]"
                  />
                </div>
            
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-bold leading-6 text-black">
                    {item.productTitle}
                  </h3>
            
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-neutral-400 sm:gap-x-4 sm:text-xs">
                    <span>
                      تعداد: {formatPrice(item.quantity)}
                    </span>
            
                    <span className="hidden h-1 w-1 self-center rounded-full bg-neutral-300 sm:block" />
            
                    <span>
                      قیمت واحد:{" "}
                      {formatPrice(finalUnitPrice)} تومان
                    </span>
            
                    {offer > 0 && (
                      <>
                        <span className="hidden h-1 w-1 self-center rounded-full bg-neutral-300 sm:block" />
            
                        <span className="font-semibold text-green-600">
                          {formatPrice(offer)}٪ تخفیف
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            
              <div className="flex items-center justify-between border-t border-neutral-100 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-left">
                <span className="text-xs text-neutral-400 sm:hidden">
                  مبلغ
                </span>
            
                <div>
                  <p className="text-sm font-black text-black sm:text-base">
                    {formatPrice(lineTotal)}
                  </p>
            
                  <p className="mt-0.5 text-[11px] text-neutral-400 sm:text-xs">
                    تومان
                  </p>
                </div>
              </div>
            </div>
          );
        })}

      </div>

    </section>
  );
}