import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export default function AuthShell({
  children,
  title,
  description,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-[calc(100svh-64px)] w-full flex-1 bg-neutral-50">
      {/* Desktop background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      >
        <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-neutral-200/50 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-neutral-200/50 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col">
        {/* Mobile back button */}
        <div className="flex px-4 pt-4 lg:hidden">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 text-sm font-semibold text-neutral-700 transition-colors active:text-black"
          >
            <span className="text-lg leading-none">
              →
            </span>

            <span>بازگشت</span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center justify-center lg:px-8 lg:py-16">
          {/* 
            MOBILE:
            - full width
            - no max-width
            - no padding
            - no card styling

            DESKTOP:
            - max-width
            - card
            - rounded
            - shadow
            - border
          */}
          <section
            className="
              flex w-full flex-1 flex-col justify-center
              bg-neutral-50
              px-5 py-8

              sm:px-8

              lg:flex-none
              lg:max-w-[440px]
              lg:rounded-[28px]
              lg:border
              lg:border-neutral-200/80
              lg:bg-white
              lg:px-8
              lg:py-8
              lg:shadow-[0_20px_60px_-25px_rgba(0,0,0,0.18)]
            "
          >
            {/* Desktop logo */}
            <div className="mb-7 hidden text-center lg:block">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-black transition-opacity hover:opacity-70"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm text-white">
                  E
                </span>

                <span>ElectroMart</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-[28px]">
                {title}
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                {description}
              </p>
            </div>

            {children}
          </section>
        </div>
      </div>
    </main>
  );
}