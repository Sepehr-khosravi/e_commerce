import Link from "next/link";

type FooterLinkGroupProps = {
  title: string;
  links: {
    label: string;
    href: string;
    id : number;
  }[];
};

export default function FooterLinks({
  title,
  links,
}: FooterLinkGroupProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-black">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              className="
                text-sm
                text-neutral-500
                transition-all
                duration-200
                hover:translate-x-[-3px]
                hover:text-black
              "
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}