"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";

type VerifyPurpose = "login" | "register";

export default function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const phone = searchParams.get("phone");
  const mode = searchParams.get("mode");

  // فقط login یا register معتبر است
  const purpose: VerifyPurpose | null =
    mode === "login" || mode === "register"
      ? mode
      : null;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!phone || !purpose) {
      router.replace("/login");
    }
  }, [phone, purpose, router]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!phone || !purpose) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          phoneNumber: phone,
          code,
          purpose,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "کد وارد شده صحیح نیست."
        );
      }

      router.replace("/");
      router.refresh();
      setTimeout(()=>{
          window.location.reload();
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "کد تایید صحیح نیست."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!phone || !purpose) {
    return null;
  }

  return (
    <AuthShell
      title="تایید شماره موبایل"
      description={`کد ارسال شده به ${phone} را وارد کنید.`}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="code"
            className="mb-2 block text-sm font-semibold text-neutral-700"
          >
            کد تایید
          </label>

          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            maxLength={6}
            placeholder="X.X.X.X.X.X"
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value.replace(/\D/g, "")
              )
            }
            className="h-14 w-full rounded-xl border border-neutral-200 bg-white px-4 text-center text-xl font-bold tracking-[0.5em] outline-none transition-all duration-200 placeholder:text-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5"
            required
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={(loading || (code.length !== 6) ? true : false)}
          className="h-12 w-full rounded-xl bg-black text-sm font-semibold text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "در حال بررسی..."
            : "تایید و ادامه"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href={
            purpose === "register"
              ? "/register"
              : "/login"
          }
          className="text-sm font-semibold text-neutral-500 transition-colors hover:text-black"
        >
          تغییر شماره موبایل
        </Link>
      </div>
    </AuthShell>
  );
}