import Link from "next/link";

export default function FooterBrand() {
  return (
    <div className="max-w-sm">
      <Link
        href="/"
        className="inline-block text-xl font-extrabold tracking-tight text-black transition-opacity duration-200 hover:opacity-70"
      >
        ElectroMart
      </Link>

      <p className="mt-4 text-sm leading-7 text-neutral-500">
        تجربه‌ای مدرن و ساده برای خرید محصولات
        دیجیتال و تکنولوژی. بهترین محصولات را با
        خیال راحت پیدا و انتخاب کنید.
      </p>
    </div>
  );
}