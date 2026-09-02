"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Tags,
  Users,
  X,
} from "lucide-react";

const menuItems = [
  {
    title: "داشبورد",
    href: "/private",
    icon: LayoutDashboard,
  },
  {
    title: "محصولات",
    href: "/private/products",
    icon: Package,
  },
  // {
  //   title: "دسته‌بندی‌ها",
  //   href: "/private/categories",
  //   icon: Tags,
  // },
  {
    title: "سفارشات",
    href: "/private/orders",
    icon: ShoppingBag,
  },
  {
    title: "کاربران",
    href: "/private/users",
    icon: Users,
  },
  {
    title: "موجودی",
    href: "/private/inventory",
    icon: Boxes,
  },
];

type AdminSidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function AdminSidebar({
  open,
  setOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          aria-label="بستن منو"
          className="
            fixed inset-0 z-50
            bg-black/20 backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      <aside
        dir="rtl"
        className={`
          relative shrink-0
          overflow-visible
          border-l border-neutral-200
          bg-white
          transition-[width]
          duration-300
          ease-in-out
          z-50

          ${open ? "w-64" : "w-0"}
        `}
      >
        {/* Sidebar content */}
        <div
          className={`
            sticky top-0
            h-screen
            w-64
            overflow-hidden
            p-5

            transition-opacity
            duration-200

            ${
              open
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }
          `}
        >
          {/* Logo */}
          <div className="mb-8 px-3">
            <Link
              href="/private"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                <LayoutDashboard size={18} />
              </div>

              <div className="whitespace-nowrap">
                <p className="text-sm font-bold text-black">
                  پنل مدیریت
                </p>

                <p className="mt-0.5 text-[10px] text-neutral-400">
                  مدیریت فروشگاه
                </p>
              </div>
            </Link>
          </div>

          {/* Title */}
          <div className="mb-3 px-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              مدیریت
            </span>
          </div>

          {/* Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/private"
                  ? pathname === "/private"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-3
                    rounded-xl px-3 py-3
                    text-sm font-semibold
                    transition-all duration-200

                    ${
                      active
                        ? "bg-black text-white"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
                    }
                  `}
                >
                  <Icon
                    size={17}
                    className="shrink-0"
                    strokeWidth={
                      active ? 2.2 : 1.8
                    }
                  />

                  <span className="whitespace-nowrap">
                    {item.title}
                  </span>

                  {active && (
                    <ChevronLeft
                      size={15}
                      className="mr-auto opacity-60"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="absolute bottom-5 right-5 left-5">
            <div className="mb-4 h-px bg-neutral-100" />

            <Link
              href="/"
              className="
                flex items-center gap-3
                rounded-xl px-3 py-3
                text-sm font-semibold
                text-neutral-400
                transition
                hover:bg-neutral-100
                hover:text-black
              "
            >
              <LogOut size={17} />

              <span className="whitespace-nowrap">
                بازگشت به فروشگاه
              </span>
            </Link>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={
            open
              ? "بستن سایدبار"
              : "باز کردن سایدبار"
          }
          className="
            absolute
            top-6
            -left-10
            z-50
            flex h-8 w-8
            items-center justify-center
            rounded-full
            border border-neutral-200
            bg-white
            text-neutral-500
            shadow-sm
            transition-all
            duration-200
            hover:bg-neutral-50
            hover:text-black
            hover:shadow-md
            
          "
        >
          {open ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>

        {/* Mobile close */}
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="
              absolute left-4 top-5
              z-50
              flex h-8 w-8
              items-center justify-center
              rounded-lg
              bg-neutral-100
              text-neutral-500
              lg:hidden
            "
          >
            <X size={16} />
          </button>
        )}
      </aside>
    </>
  );
}