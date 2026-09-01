import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import FooterSocials from "./FooterSocials";

const shopLinks = [
  {
    label: "محصولات",
    href: "/products",
  },
  {
    label: "دسته‌بندی‌ها",
    href: "/products",
  },
  {
    label: "محصولات جدید",
    href: "/products?sort=newest",
  },
];

const accountLinks = [
  {
    label: "حساب کاربری",
    href: "/dashboard",
  },
  {
    label: "سفارش‌های من",
    href: "/dashboard/orders",
  },
  {
    label: "سبد خرید",
    href: "/cart",
  },
];

const companyLinks = [
  {
    label: "درباره ما",
    href: "/about",
  },
  {
    label: "تماس با ما",
    href: "/contact",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <div
          className="
            grid
            gap-12
            py-14
            sm:grid-cols-2
            lg:grid-cols-[2fr_1fr_1fr_1fr]
            lg:gap-10
          "
        >
          <FooterBrand />

          <FooterLinks
            title="فروشگاه"
            links={shopLinks}
          />

          <FooterLinks
            title="حساب کاربری"
            links={accountLinks}
          />

          <div className="flex flex-col gap-8">
            <FooterLinks
              title="درباره ما"
              links={companyLinks}
            />

            <FooterSocials />
          </div>
        </div>

        {/* Bottom */}
        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-neutral-100
            py-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} ElectroMart.
            تمامی حقوق محفوظ است.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="#"
              className="text-xs text-neutral-400 transition-colors hover:text-black"
            >
              حریم خصوصی
            </a>

            <a
              href="#"
              className="text-xs text-neutral-400 transition-colors hover:text-black"
            >
              قوانین و مقررات
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}