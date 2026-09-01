import Link from "next/link";

const links = [
  { name: "خانه", href: "/" },
  { name: "محصولات", href: "/products" },
  { name: "درباره ما", href: "/about" },
  { name: "تماس با ما", href: "/contact" },
];

type NavLinksProps = {
  mobile?: boolean;
};

export default function NavLinks({
  mobile = false,
}: NavLinksProps) {
  if (mobile) {
    return (
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-black"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-7">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-neutral-600 transition-colors hover:text-black focus:outline-none"
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}