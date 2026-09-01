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
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber : phone,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "شماره موبایل وارد شده صحیح نیست."
        );
      }

      // OTP page needs the phone number
      router.push(
        `/verify?phone=${encodeURIComponent(phone)}&mode=login`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="ورود به حساب"
      description="شماره موبایل خود را وارد کنید تا کد ورود برای شما ارسال شود."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-semibold text-neutral-700"
          >
            شماره موبایل
          </label>

          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="09123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition-all duration-200 placeholder:text-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5"
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
          disabled={loading}
          className="h-12 w-full rounded-xl bg-black text-sm font-semibold text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "در حال ارسال..." : "دریافت کد ورود"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-500">
        حساب کاربری ندارید؟{" "}
        <Link
          href="/register"
          className="font-semibold text-black transition-colors hover:text-neutral-500"
        >
          ثبت‌نام کنید
        </Link>
      </div>
    </AuthShell>
  );
}