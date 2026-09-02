function Circle() {
  return (
      // <div 
      //   className="
      //     absolute 
      //     w-80 
      //     h-80 
      //     top-3/6 
      //     left-3/6 
      //     -translate-x-3/6 
      //     -translate-y-3/6 
      //     -z-10
      //     rounded-full
      //     bg-gradient-to-br
      //     from-blue-500
      //     via-purple-500
      //     to-pink-500
      //     blur-2xl
      //     opacity-70
      //     animate-pulse
      //     hover:scale-110
      //     hover:opacity-90
      //     transition-all
      //     duration-700
      //     ease-in-out
      //     shadow-2xl
      //     shadow-blue-500/20
      //   "
      // />  
      <></>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <Circle/>
      <div className="mx-auto flex min-h-[560] max-w-7xl items-center justify-center px-5 py-20 text-center sm:px-6 lg:px-8">

        <div className="flex max-w-3xl flex-col items-center">

          <div className="mb-6 inline-flex items-center rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-600">
            نسل جدید تکنولوژی
          </div>

          <h1 className="text-4xl font-bold leading-[1.25] tracking-tight text-black sm:text-5xl lg:text-6xl">
            بهترین محصولات
            <br />
            <span className="text-neutral-400">
              دنیای تکنولوژی
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
            جدیدترین محصولات دیجیتال و گجت‌های روز را با
            تجربه‌ای ساده، سریع و مطمئن پیدا کنید.
            کیفیت، قیمت مناسب و تجربه خرید بهتر؛ همه در یک جا.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="#products"
              className="rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg hover:shadow-black/10 active:translate-y-0"
            >
              مشاهده محصولات
            </a>

            <a
              href="#categories"
              className="rounded-xl bg-neutral-100 px-6 py-3.5 text-sm font-semibold text-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-neutral-200 active:translate-y-0"
            >
              دسته‌بندی‌ها
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}