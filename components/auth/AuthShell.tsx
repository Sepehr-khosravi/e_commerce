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
      {/* Background decoration - desktop only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      >
        <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-neutral-200/50 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-neutral-200/50 blur-3xl" />
      </div>

      {/* Mobile / Desktop content */}
      <div className="relative z-10 flex w-full flex-1 flex-col">
        {/* Mobile back button */}
        <div className="flex items-center px-4 pt-4 sm:px-6 lg:hidden">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 active:scale-95"
          >
            <span className="text-base">→</span>

            <span>بازگشت</span>
          </Link>
        </div>

        {/* Main area */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
          <div className="w-full max-w-[440px]">
            {/* Brand */}
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

            {/* Auth card */}
            <section className="w-full rounded-[28px] border border-neutral-200/80 bg-white p-5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.18)] sm:p-7 lg:p-8">
              {/* Header */}
              <div className="mb-7 text-center sm:mb-8">
                <h1 className="text-[24px] font-bold tracking-tight text-neutral-950 sm:text-[28px]">
                  {title}
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                  {description}
                </p>
              </div>

              {children}
            </section>

            {/* Security text */}
            <p className="mt-5 hidden text-center text-xs text-neutral-400 sm:block">
              اطلاعات شما با امنیت کامل نزد ElectroMart محفوظ است.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}