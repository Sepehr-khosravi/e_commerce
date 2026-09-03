"use client";

import {
  BarChart3,
  Boxes,
  ChevronLeft,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminSidebar } from "./adminSidebar";
import Loading from "@/app/loading";

export type DashboardData = {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  lowStock: number;
  outOfStock: number;

  chart: {
    label: string;
    revenue: number;
  }[];
};


function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch(
          "/api/admin/inventory",
          {
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

        const data =
          await response.json();

        console.log(data);

        setDashboard(data);
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error
        );

        setError(true);
      } finally {
        setTimeout(()=>{
          setLoading(false);
        }, 2000);
        
      }
    }

    loadDashboard();
  }, []);

  return (
    loading ? <Loading /> 
    : (
          <main
      dir="rtl"
      className="min-h-screen bg-neutral-50"
    >
      <div className="flex min-h-screen">



        {/* ================= MAIN ================= */}

        <div className="min-w-0 flex-1">

          {/* Header */}

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

          <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

            {/* Page title */}

            <div className="mb-8">

              <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                گزارش فروش
              </h1>

              <p className="mt-2 text-sm text-neutral-400">
                وضعیت مالی و عملکرد فروشگاه
              </p>

            </div>

            {loading ? (
              <DashboardSkeleton />
            ) : error ? (
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
    )
  );
}

function DashboardContent({
  data,
}: {
  data: DashboardData;
}) {
  return (
    <>
      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="درآمد کل"
          value={`${formatPrice(
            data.totalRevenue
          )} تومان`}
          icon={
            <CircleDollarSign
              size={19}
            />
          }
        />

        <StatCard
          title="درآمد امروز"
          value={`${formatPrice(
            data.todayRevenue
          )} تومان`}
          icon={
            <TrendingUp
              size={19}
            />
          }
        />

        <StatCard
          title="تعداد سفارشات"
          value={formatPrice(
            data.totalOrders
          )}
          icon={
            <ShoppingBag
              size={19}
            />
          }
        />

        <StatCard
          title="کاربران"
          value={formatPrice(
            data.totalUsers
          )}
          icon={
            <Users size={19} />
          }
        />

      </div>

      {/* Secondary stats */}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">

        <MiniStat
          title="محصولات"
          value={data.totalProducts}
        />

        <MiniStat
          title="موجودی کم"
          value={data.lowStock}
        />

        <MiniStat
          title="ناموجود"
          value={data.outOfStock}
        />

      </div>

      {/* Revenue chart */}

      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-base font-bold text-black">
              درآمد
            </h2>

            <p className="mt-1 text-xs text-neutral-400">
              روند درآمد فروشگاه
            </p>

          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
            <TrendingUp
              size={17}
            />
          </div>

        </div>

        <RevenueChart
          data={data.chart}
        />

      </section>
    </>
  );
}

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

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4">

      <p className="text-xs text-neutral-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-bold text-black">
        {formatPrice(value)}
      </p>

    </div>
  );
}


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

      <div className="flex h-72 items-end gap-2 overflow-x-auto pb-8 sm:gap-4">

        {data.map((item) => {
          const height =
            (item.revenue /
              maxRevenue) *
            100;

          return (
            <div
              key={item.label}
              className="group flex h-full min-w-8 flex-1 flex-col justify-end sm:min-w-10"
            >

              <div className="relative flex h-full items-end">

                <div
                  className="relative w-full rounded-t-xl bg-black transition-all duration-300 group-hover:opacity-70"
                  style={{
                    height: `${Math.max(
                      height,
                      2
                    )}%`,
                  }}
                >

                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[9px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    {formatPrice(
                      item.revenue
                    )}{" "}
                    تومان
                  </div>

                </div>

              </div>

              <span className="mt-3 text-center text-[9px] text-neutral-400">
                {item.label}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}

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

      <div className="mt-4 grid gap-4 sm:grid-cols-3">

        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl bg-neutral-200"
          />
        ))}

      </div>

      <div className="mt-6 h-[420px] animate-pulse rounded-3xl bg-neutral-200" />
    </>
  );
}

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