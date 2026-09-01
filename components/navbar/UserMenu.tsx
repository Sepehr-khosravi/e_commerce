import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type UserMenuProps = {
  mobile?: boolean;
};

export default function UserMenu({
  mobile = false,
}: UserMenuProps) {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  // Loading state
  if (isLoading) {
    return mobile ? (
      <div className="h-11 w-full animate-pulse rounded-xl bg-neutral-100" />
    ) : (
      <div className="h-10 w-24 animate-pulse rounded-xl bg-neutral-100" />
    );
  }

  // Authenticated user
  if (isAuthenticated && user) {
    return (
      <Link
        href="/dashboard"
        className={
          mobile
            ? "flex items-center gap-3 rounded-xl p-2 transition-all duration-300 hover:bg-neutral-50"
            : "group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-300 hover:bg-neutral-50"
        }
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-transform duration-300 group-hover:scale-105">
          {user.firstName?.charAt(0)?.toUpperCase() || "U"}
        </div>

        {/* User info */}
        <div className="min-w-0 text-right">
          <p className="truncate text-xs font-bold text-black">
            {user.firstName || "کاربر"}
          </p>

          <p className="mt-0.5 text-[10px] text-neutral-400">
            حساب کاربری
          </p>
        </div>
      </Link>
    );
  }

  // Guest - Mobile
  if (mobile) {
    return (
      <div className="flex w-full gap-2">
        <Link
          href="/login"
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-neutral-100 text-sm font-medium text-black transition-all duration-300 hover:bg-neutral-200 active:scale-[0.98]"
        >
          ورود
        </Link>

        <Link
          href="/register"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-black text-sm font-medium text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.98]"
        >
          <UserRound size={16} />
          ثبت‌نام
        </Link>
      </div>
    );
  }

  // Guest - Desktop
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-neutral-50 hover:text-black focus:outline-none"
      >
        ورود
      </Link>

      <Link
        href="/register"
        className="flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.97] focus:outline-none"
      >
        <UserRound size={16} />
        ثبت‌نام
      </Link>
    </div>
  );
}