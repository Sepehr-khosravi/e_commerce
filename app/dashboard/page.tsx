"use client";

import Link from "next/link";
import {
  UserRound,
  MapPin,
  ShoppingBag,
  Heart,
  LogOut,
  ChevronLeft,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
  } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="h-40 animate-pulse rounded-3xl bg-white" />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="h-28 animate-pulse rounded-2xl bg-white" />
            <div className="h-28 animate-pulse rounded-2xl bg-white" />
            <div className="h-28 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5">
        <div className="text-center">
          <h1 className="text-xl font-bold">
            برای مشاهده این صفحه وارد شوید
          </h1>

          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            ورود به حساب
          </Link>
        </div>
      </main>
    );
  }

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="relative overflow-hidden rounded-[28px] bg-black p-6 text-white sm:p-8">

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black">
                {initials || "U"}
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-neutral-400">
                  حساب کاربری
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  سلام، {user.firstName}
                </h1>

                <p className="mt-1 text-sm text-neutral-400">
                  به حساب کاربری خودت خوش آمدی.
                </p>
              </div>

            </div>

            <button
              onClick={logout}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 transition-all duration-300 hover:bg-white hover:text-black"
            >
              <LogOut size={15} />
              خروج از حساب
            </button>

          </div>

          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full border border-white/5" />

        </section>


        {/* Quick Actions */}
        <section className="mt-6 grid gap-4 sm:grid-cols-4">

          <DashboardCard
            href="/dashboard/orders"
            icon={<ShoppingBag size={20} />}
            title="سفارش‌های من"
            description="مشاهده سفارش‌های اخیر"
          />

          <DashboardCard
            href="/dashboard/favorites"
            icon={<Heart size={20} />}
            title="علاقه‌مندی‌ها"
            description="محصولات ذخیره‌شده"
          />

          <DashboardCard
            href="/cart"
            icon={<UserRound size={20} />}
            title="سبد خرید"
            description="مشاهده محصولات در سبد خرید"
          />

          <DashboardCard
            href="/dashboard/profile"
            icon={<UserRound size={20} />}
            title="اطلاعات حساب"
            description="مدیریت مشخصات شخصی"
          />
          

        </section>


        {/* Account information */}
        <section className="mt-6 rounded-3xl border border-neutral-100 bg-white p-5 sm:p-7">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Account
              </p>

              <h2 className="mt-1 text-lg font-bold text-black">
                اطلاعات حساب
              </h2>
            </div>

            <UserRound
              size={20}
              className="text-neutral-300"
            />
          </div>


          <div className="grid gap-3 sm:grid-cols-2">

            <InfoItem
              label="نام و نام خانوادگی"
              value={`${user.firstName} ${user.lastName}`}
            />

            <InfoItem
              label="شماره موبایل"
              value={user.phoneNumber}
            />

            <InfoItem
              label="وضعیت شماره موبایل"
              value={
                user.phoneVerified
                  ? "تأیید شده"
                  : "تأیید نشده"
              }
            />

            <InfoItem
              label="آدرس"
              value={
                user.address || "هنوز ثبت نشده"
              }
              icon={
                <MapPin size={15} />
              }
            />

          </div>

        </section>


        {/* Bottom */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold text-neutral-400 transition-colors duration-200 hover:text-black"
          >
            بازگشت به فروشگاه

            <ChevronLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
          </Link>
        </div>

      </div>
    </main>
  );
}


function DashboardCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-lg hover:shadow-black/[0.03]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-black">
          {title}
        </h3>

        <p className="mt-1 text-[11px] text-neutral-400">
          {description}
        </p>
      </div>

      <ChevronLeft
        size={16}
        className="mr-auto text-neutral-300 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-black"
      />
    </Link>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-neutral-50 p-3 sm:p-4">
      <p className="truncate text-[10px] font-medium text-neutral-400 sm:text-[11px]">
        {label}
      </p>

      <div className="mt-2 flex min-w-0 items-center gap-2">
        {icon && (
          <span className="shrink-0 text-neutral-400">
            {icon}
          </span>
        )}

        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-black sm:text-sm">
          {value}
        </p>
      </div>
    </div>
  );
}