import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-white px-5 py-16"
    >
      <section className="w-full max-w-2xl text-center">

        {/* 404 */}
        <div className="relative mx-auto mb-8 w-fit">
          <span className="select-none text-[clamp(7rem,25vw,13rem)] font-black leading-none tracking-tighter text-neutral-100">
            404
          </span>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-black px-5 py-3 shadow-xl shadow-black/10">
              <span className="text-sm font-bold tracking-widest text-white">
                PAGE NOT FOUND
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
            این صفحه پیدا نشد
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-500 sm:text-base">
            به نظر می‌رسه صفحه‌ای که دنبالشی وجود نداره،
            حذف شده یا آدرس اون اشتباه وارد شده.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">

          <Link
            href="/"
            className="
              group
              flex
              h-12
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-black
              px-6
              text-sm
              font-semibold
              text-white
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-neutral-800
              hover:shadow-lg
              hover:shadow-black/10
              focus:outline-none
              focus:ring-2
              focus:ring-black
              focus:ring-offset-2
            "
          >
            <Home size={17} />

            <span>
              بازگشت به خانه
            </span>
          </Link>

          <Link
            href="/search"
            className="
              flex
              h-12
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-neutral-100
              px-6
              text-sm
              font-semibold
              text-black
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-neutral-200
              focus:outline-none
              focus:ring-2
              focus:ring-neutral-300
              focus:ring-offset-2
            "
          >
            <Search size={17} />

            <span>
              جستجوی محصولات
            </span>

            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          </Link>

        </div>

        {/* Bottom hint */}
        <div className="mt-12">
          <div className="mx-auto h-px w-16 bg-neutral-200" />

          <p className="mt-5 text-xs text-neutral-400">
            ElectroMart
          </p>
        </div>

      </section>
    </main>
  );
}