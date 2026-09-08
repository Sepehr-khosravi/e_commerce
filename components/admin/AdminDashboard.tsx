"use client";

import {
  BarChart3,
  CircleDollarSign,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminSidebar } from "./adminSidebar";
import Loading from "@/app/loading";

export type DashboardData = {
  totalRevenue: number;
  todayRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowth: number;

  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;

  averageOrderValue: number;

  totalUsers: number;
  newUsersThisMonth: number;

  totalProducts: number;
  lowStock: number;
  outOfStock: number;

  chart: {
    label: string;
    revenue: number;
  }[];

  previousMonthChart: {
    label: string;
    revenue: number;
  }[];

  topProducts: {
    id: number;
    title: string;
    quantity: number;
    revenue: number;
  }[];

  orderStatuses: {
    status: string;
    count: number;
  }[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    Math.round(value)
  );
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 1,
  }).format(value);
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          "/api/admin/dashboard",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (response.status === 403) {
          window.location.href = "/403";
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load dashboard"
          );
        }

        const data: DashboardData =
          await response.json();

        if (!mounted) {
          return;
        }

        setDashboard(data);
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error
        );

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50"
    >
      <div className="flex min-h-screen">

        {/* ================= SIDEBAR ================= */}

        {/* <AdminSidebar /> */}

        {/* ================= MAIN ================= */}

        <div className="min-w-0 flex-1">

          {/* ================= HEADER ================= */}

          <header className="sticky top-0 z-20 flex h-20 items-center border-b border-neutral-200 bg-white/90 px-5 backdrop-blur sm:px-8">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Dashboard
              </p>

              <h2 className="mt-1 text-lg font-bold text-black">
                نمای کلی فروشگاه
              </h2>
            </div>

          </header>

          {/* ================= CONTENT ================= */}

          <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

            {/* PAGE TITLE */}

            <div className="mb-8">

              <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                گزارش فروش
              </h1>

              <p className="mt-2 text-sm text-neutral-400">
                وضعیت مالی و عملکرد فروشگاه
              </p>

            </div>

            {error ? (
              <DashboardError />
            ) : dashboard ? (
              <DashboardContent
                data={dashboard}
              />
            ) : null}

          </section>

        </div>
      </div>
    </main>
  );
}

/* =========================================================
   DASHBOARD CONTENT
========================================================= */

function DashboardContent({
  data,
}: {
  data: DashboardData;
}) {
  return (
    <>
      {/* ================= MAIN STATS ================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="فروش کل"
          value={`${formatPrice(
            data.totalRevenue
          )} تومان`}
          icon={
            <CircleDollarSign size={19} />
          }
        />

        <StatCard
          title="فروش این ماه"
          value={`${formatPrice(
            data.currentMonthRevenue
          )} تومان`}
          icon={
            <TrendingUp size={19} />
          }
        />

        <StatCard
          title="سفارش‌های پرداخت‌شده"
          value={formatPrice(
            data.paidOrders
          )}
          icon={
            <ShoppingBag size={19} />
          }
        />

        <StatCard
          title="میانگین مبلغ سفارش"
          value={`${formatPrice(
            data.averageOrderValue
          )} تومان`}
          icon={
            <CircleDollarSign size={19} />
          }
        />

      </div>

      {/* ================= SECONDARY STATS ================= */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MiniStat
          title="فروش امروز"
          value={`${formatPrice(
            data.todayRevenue
          )} تومان`}
        />

        <MiniStat
          title="فروش ماه قبل"
          value={`${formatPrice(
            data.previousMonthRevenue
          )} تومان`}
        />

        <MiniStat
          title="کاربران جدید این ماه"
          value={data.newUsersThisMonth}
        />

        <MiniStat
          title="کل کاربران"
          value={data.totalUsers}
        />

      </div>

      {/* ================= REVENUE COMPARISON ================= */}

      <RevenueComparison
        current={data.currentMonthRevenue}
        previous={data.previousMonthRevenue}
        growth={data.revenueGrowth}
      />

      {/* ================= REVENUE CHART ================= */}

      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-base font-bold text-black">
              فروش این ماه
            </h2>

            <p className="mt-1 text-xs text-neutral-400">
              میزان فروش موفق به تفکیک روز
            </p>

          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
            <BarChart3 size={17} />
          </div>

        </div>

        <RevenueChart
          data={data.chart}
        />

      </section>

      {/* ================= LOWER GRID ================= */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">

        {/* TOP PRODUCTS */}

        <TopProducts
          products={data.topProducts}
        />

        {/* ORDER STATUS */}

        <OrderStatus
          statuses={data.orderStatuses}
          paidOrders={data.paidOrders}
          pendingOrders={data.pendingOrders}
          cancelledOrders={data.cancelledOrders}
          refundedOrders={data.refundedOrders}
        />

      </div>

      {/* ================= INVENTORY ================= */}

      <InventoryOverview
        totalProducts={data.totalProducts}
        lowStock={data.lowStock}
        outOfStock={data.outOfStock}
      />

    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-black">
        {icon}
      </div>

      <p className="mt-6 text-xs font-medium text-neutral-400">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold tracking-tight text-black">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4">

      <p className="text-xs text-neutral-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-bold text-black">
        {typeof value === "number"
          ? formatPrice(value)
          : value}
      </p>

    </div>
  );
}

/* =========================================================
   REVENUE COMPARISON
========================================================= */

function RevenueComparison({
  current,
  previous,
  growth,
}: {
  current: number;
  previous: number;
  growth: number;
}) {
  const positive = growth >= 0;

  return (
    <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="text-base font-bold text-black">
            مقایسه فروش
          </h2>

          <p className="mt-1 text-xs text-neutral-400">
            مقایسه فروش این ماه با ماه گذشته
          </p>

        </div>

        <div
          className={`flex items-center gap-2 self-start rounded-xl px-3 py-2 text-xs font-bold ${
            positive
              ? "bg-neutral-100 text-black"
              : "bg-neutral-200 text-neutral-600"
          }`}
        >
          {positive ? (
            <TrendingUp size={15} />
          ) : (
            <TrendingDown size={15} />
          )}

          <span>
            {positive ? "+" : ""}
            {formatPercent(growth)}%
          </span>

        </div>

      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl bg-neutral-50 p-5">

          <p className="text-xs text-neutral-400">
            فروش این ماه
          </p>

          <p className="mt-2 text-xl font-bold text-black">
            {formatPrice(current)}
            {" "}
            تومان
          </p>

        </div>

        <div className="rounded-2xl bg-neutral-50 p-5">

          <p className="text-xs text-neutral-400">
            فروش ماه قبل
          </p>

          <p className="mt-2 text-xl font-bold text-black">
            {formatPrice(previous)}
            {" "}
            تومان
          </p>

        </div>

      </div>

    </section>
  );
}

/* =========================================================
   REVENUE CHART
========================================================= */

function RevenueChart({
  data,
}: {
  data: {
    label: string;
    revenue: number;
  }[];
}) {
  if (!data?.length) {
    return (
      <div className="mt-8 flex h-72 items-center justify-center rounded-2xl bg-neutral-50">
        <p className="text-sm text-neutral-400">
          اطلاعاتی برای نمایش وجود ندارد.
        </p>
      </div>
    );
  }

  const maxRevenue = Math.max(
    ...data.map(
      (item) => item.revenue
    ),
    1
  );

  return (
    <div className="mt-8">

      <div className="flex h-72 items-end gap-2 overflow-x-auto border-b border-neutral-100 pb-2 sm:gap-3">

        {data.map((item) => {

          const height =
            item.revenue === 0
              ? 0
              : (item.revenue /
                  maxRevenue) *
                100;

          return (
            <div
              key={item.label}
              className="group flex h-full min-w-7 flex-1 flex-col justify-end sm:min-w-8"
            >

              <div className="relative flex h-full items-end">

                <div
                  className="relative w-full rounded-t-lg bg-black transition-all duration-300 group-hover:opacity-70"
                  style={{
                    height:
                      item.revenue === 0
                        ? "2px"
                        : `${Math.max(
                            height,
                            3
                          )}%`,
                  }}
                >

                  {item.revenue > 0 && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[9px] font-semibold text-white opacity-0 transition group-hover:opacity-100">

                      {formatPrice(
                        item.revenue
                      )}

                      {" "}
                      تومان

                    </div>
                  )}

                </div>

              </div>

              <span className="mt-3 text-center text-[9px] text-neutral-400">
                {item.label}
              </span>

            </div>
          );
        })}

      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] text-neutral-400">

        <span>
          روز اول ماه
        </span>

        <span>
          روز آخر ماه
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   TOP PRODUCTS
========================================================= */

function TopProducts({
  products,
}: {
  products: DashboardData["topProducts"];
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-base font-bold text-black">
            پرفروش‌ترین محصولات
          </h2>

          <p className="mt-1 text-xs text-neutral-400">
            بر اساس فروش موفق
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
          <Package size={17} />
        </div>

      </div>

      <div className="mt-6 space-y-3">

        {!products?.length ? (
          <EmptyState text="هنوز فروشی ثبت نشده است." />
        ) : (
          products.map(
            (product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-semibold text-black">
                    {product.title}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {formatPrice(
                      product.quantity
                    )}
                    {" "}
                    عدد فروش
                  </p>

                </div>

                <div className="text-left">

                  <p className="text-xs font-bold text-black">
                    {formatPrice(
                      product.revenue
                    )}
                  </p>

                  <p className="mt-1 text-[9px] text-neutral-400">
                    تومان
                  </p>

                </div>

              </div>
            )
          )
        )}

      </div>

    </section>
  );
}

/* =========================================================
   ORDER STATUS
========================================================= */

function OrderStatus({
  statuses,
  paidOrders,
  pendingOrders,
  cancelledOrders,
  refundedOrders,
}: {
  statuses: DashboardData["orderStatuses"];
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
}) {
  const statusMap = new Map(
    statuses?.map((item) => [
      item.status,
      item.count,
    ]) ?? []
  );

  const items = [
    {
      label: "پرداخت‌شده",
      value: paidOrders,
    },
    {
      label: "در انتظار پرداخت",
      value: pendingOrders,
    },
    {
      label: "لغوشده",
      value:
        statusMap.get("CANCELLED") ??
        cancelledOrders,
    },
    {
      label: "مرجوع‌شده",
      value: refundedOrders,
    },
  ];

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-base font-bold text-black">
            وضعیت سفارش‌ها
          </h2>

          <p className="mt-1 text-xs text-neutral-400">
            وضعیت سفارش‌های فروشگاه
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
          <ShoppingBag size={17} />
        </div>

      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">

        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-neutral-50 p-4"
          >

            <p className="text-xs text-neutral-400">
              {item.label}
            </p>

            <p className="mt-2 text-xl font-bold text-black">
              {formatPrice(item.value)}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

/* =========================================================
   INVENTORY
========================================================= */

function InventoryOverview({
  totalProducts,
  lowStock,
  outOfStock,
}: {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-base font-bold text-black">
            وضعیت موجودی
          </h2>

          <p className="mt-1 text-xs text-neutral-400">
            وضعیت فعلی محصولات فروشگاه
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
          <Package size={17} />
        </div>

      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">

        <MiniStat
          title="کل محصولات"
          value={totalProducts}
        />

        <MiniStat
          title="موجودی کم"
          value={lowStock}
        />

        <MiniStat
          title="ناموجود"
          value={outOfStock}
        />

      </div>

    </section>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 py-12 text-center">

      <p className="text-sm text-neutral-400">
        {text}
      </p>

    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-3xl bg-neutral-200"
          />
        ))}

      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl bg-neutral-200"
          />
        ))}

      </div>

      <div className="mt-6 h-44 animate-pulse rounded-3xl bg-neutral-200" />

      <div className="mt-6 h-[420px] animate-pulse rounded-3xl bg-neutral-200" />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">

        <div className="h-80 animate-pulse rounded-3xl bg-neutral-200" />

        <div className="h-80 animate-pulse rounded-3xl bg-neutral-200" />

      </div>

    </>
  );
}

/* =========================================================
   ERROR
========================================================= */

function DashboardError() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-24 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">

        <BarChart3
          size={22}
          className="text-neutral-400"
        />

      </div>

      <h2 className="mt-5 text-base font-bold text-black">
        دریافت اطلاعات با مشکل مواجه شد
      </h2>

      <p className="mt-2 text-xs text-neutral-400">
        لطفاً دوباره تلاش کنید.
      </p>

      <button
        type="button"
        onClick={() =>
          window.location.reload()
        }
        className="mt-5 rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
      >
        تلاش دوباره
      </button>

    </div>
  );
}