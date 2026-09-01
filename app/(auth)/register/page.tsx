"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber : phone,
          firstName : firstName,
          lastName : lastName
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.log(data);
        throw new Error(
          data?.message || "ثبت‌نام انجام نشد."
        );
      }

      router.push(
        `/verify?phone=${encodeURIComponent(phone)}&mode=register`
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
      title="ساخت حساب کاربری"
      description="برای شروع خرید، شماره موبایل خود را وارد کنید."
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
            dir="rtl"
            placeholder="09123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition-all duration-200 placeholder:text-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5"
            required
          />
        </div>

                <div>
          <label
            htmlFor="first-name"
            className="mb-2 block text-sm font-semibold text-neutral-700"
          >
            نام
          </label>

          <input
            id="first-name"
            type="text"
            minLength={4}
            max={30}
            inputMode="text"
            dir="rtl"
            placeholder="نام"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition-all duration-200 placeholder:text-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5"
            required
          />
        </div>

                <div>
          <label
            htmlFor="last name"
            className="mb-2 block text-sm font-semibold text-neutral-700"
          >
            نام خانوادگی 
          </label>

          <input
            id="last-name"
            type="text"
            minLength={4}
            max={30}            
            inputMode="text"
            dir="rtl"
            placeholder="نام خانوادگی"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
          {loading ? "در حال ارسال..." : "ادامه ثبت‌نام"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-500">
        قبلاً حساب ساخته‌اید؟{" "}
        <Link
          href="/login"
          className="font-semibold text-black transition-colors hover:text-neutral-500"
        >
          وارد شوید
        </Link>
      </div>
    </AuthShell>
  );
}