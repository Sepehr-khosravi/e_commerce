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
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link
          href="/"
          className="mb-8 block text-center text-xl font-bold tracking-tight text-black"
        >
          ElectroMart
        </Link>

        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-black">
              {title}
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {description}
            </p>
          </div>

          {children}

        </div>
      </div>
    </main>
  );
}