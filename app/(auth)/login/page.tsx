"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      setError("لطفاً شماره موبایل خود را وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "شماره موبایل وارد شده صحیح نیست."
        );
      }

      router.push(
        `/verify?phone=${encodeURIComponent(
          normalizedPhone
        )}&mode=login`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد. دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="خوش آمدید"
      description="برای ورود به حساب کاربری، شماره موبایل خود را وارد کنید."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="phone"
            className="mb-2.5 block text-sm font-semibold text-neutral-800"
          >
            شماره موبایل
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            placeholder="09123456789"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value.replace(/[^\d۰-۹]/g, "")
              )
            }
            className="h-13 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5"
            required
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
              !
            </span>

            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>در حال ارسال کد...</span>
            </>
          ) : (
            "دریافت کد ورود"
          )}
        </button>
      </form>

      <div className="mt-7 border-t border-neutral-100 pt-6 text-center">
        <p className="text-sm text-neutral-500">
          حساب کاربری ندارید؟
        </p>

        <Link
          href="/register"
          className="mt-1 inline-block text-sm font-bold text-neutral-950 transition-colors hover:text-neutral-500"
        >
          ساخت حساب جدید
        </Link>
      </div>
    </AuthShell>
  );
}