import {
  Check,
  Clock3,
  Package,
  Truck,
  X,
} from "lucide-react";

import type { OrderStatusType } from "@/app/dashboard/orders/[id]/page";

type Props = {
  status: OrderStatusType;
  createdAt: string;
};

const steps = [
  {
    key: "PENDING",
    title: "ثبت سفارش",
    description: "سفارش شما ثبت شده است",
    icon: Clock3,
  },
  {
    key: "PROCESSING",
    title: "در حال پردازش",
    description: "سفارش در حال آماده‌سازی است",
    icon: Package,
  },
  {
    key: "SHIPPED",
    title: "ارسال شده",
    description: "سفارش تحویل شرکت حمل شده است",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    title: "تحویل داده شده",
    description: "سفارش با موفقیت تحویل داده شد",
    icon: Check,
  },
];

const order = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function OrderTimeline({
  status,
}: Props) {
  if (
    status === "CANCELLED" ||
    status === "REFUNDED"
  ) {
    const isCancelled = status === "CANCELLED";

    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-4">

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isCancelled
                ? "bg-red-50 text-red-500"
                : "bg-purple-50 text-purple-500"
            }`}
          >
            <X size={22} />
          </div>

          <div>
            <h2 className="font-bold text-black">
              {isCancelled
                ? "سفارش لغو شده"
                : "سفارش بازپرداخت شده"}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              وضعیت نهایی این سفارش است.
            </p>
          </div>

        </div>

      </div>
    );
  }

  const currentIndex = order.indexOf(status);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">

      <h2 className="mb-7 text-base font-bold text-black">
        وضعیت سفارش
      </h2>

      <div className="relative">

        <div className="absolute left-[23px] right-[23px] top-6 hidden h-px bg-neutral-200 sm:block" />

        <div className="grid gap-7 sm:grid-cols-4">

          {steps.map((step, index) => {
            const Icon = step.icon;

            const completed =
              index <= currentIndex;

            const current =
              index === currentIndex;

            return (
              <div
                key={step.key}
                className="relative text-center"
              >

                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                      completed
                        ? "border-green-200 bg-green-50 text-green-600"
                        : "border-neutral-200 bg-neutral-50 text-neutral-300"
                    } ${
                      current
                        ? "ring-4 ring-green-50"
                        : ""
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                </div>

                <h3
                  className={`mt-3 text-sm font-bold ${
                    completed
                      ? "text-black"
                      : "text-neutral-400"
                  }`}
                >
                  {step.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-neutral-400">
                  {step.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}