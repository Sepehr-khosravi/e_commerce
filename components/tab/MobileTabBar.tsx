"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Package,
  Search,
} from "lucide-react";

const tabs = [
  {
    title: "خانه",
    href: "/",
    icon: Home,
  },
  {
    title: "محصولات",
    href: "/products",
    icon: Package,
  },
  {
    title: "جستجو",
    href: "/search",
    icon: Search,
  },
  {
    title: "پروفایل",
    href: "/dashboard",
    icon: User,
  },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      dir="rtl"
      className="
        fixed bottom-0 right-0 left-0 z-50
        border-t border-neutral-200
        bg-white/95
        backdrop-blur-xl
        lg:hidden
      "
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex min-w-[64px]
                flex-col items-center justify-center
                gap-1.5
                rounded-xl
                py-1.5
                text-[10px] font-semibold
                transition-all duration-200
                ${
                  active
                    ? "text-black"
                    : "text-neutral-400 hover:text-neutral-600"
                }
              `}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.3 : 1.8}
              />

              <span>{tab.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}