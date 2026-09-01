import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white transition-transform duration-300 group-hover:rotate-[-6deg]">
        <span className="text-sm font-bold">N</span>
      </div>

      <span className="text-lg font-bold tracking-tight text-black">
        NEXORA
      </span>
    </Link>
  );
}