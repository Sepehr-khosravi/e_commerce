"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";

type VerifyPurpose = "login" | "register";

export default function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const phone = searchParams.get("phone");
  const mode = searchParams.get("mode");

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

    if (code.length !== 6) {
      setError("کد تایید باید ۶ رقم باشد.");
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
          data?.message ||
            data?.error ||
            "کد وارد شده صحیح نیست."
        );
      }

      router.replace("/");
      // router.refresh();
      window.location.reload();
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
      description={`کد تایید ارسال شده به ${phone} را وارد کنید.`}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="code"
            className="mb-2.5 block text-sm font-semibold text-neutral-800"
          >
            کد تایید
          </label>

          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(event) => {
              const value =
                event.target.value.replace(/\D/g, "");

              setCode(value.slice(0, 6));
            }}
            className="h-16 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-center text-2xl font-bold tracking-[0.65em] text-neutral-950 outline-none transition-all placeholder:text-neutral-300 placeholder:tracking-[0.45em] focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 sm:text-3xl"
            required
          />

          <p className="mt-2 text-center text-xs text-neutral-400">
            کد ۶ رقمی ارسال شده را وارد کنید
          </p>
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
          disabled={loading || code.length !== 6}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>در حال بررسی...</span>
            </>
          ) : (
            "تایید و ورود"
          )}
        </button>
      </form>

      <div className="mt-7 border-t border-neutral-100 pt-6 text-center">
        <p className="text-sm text-neutral-500">
          شماره اشتباه است؟
        </p>

        <Link
          href={
            purpose === "register"
              ? "/register"
              : "/login"
          }
          className="mt-1 inline-block text-sm font-bold text-neutral-950 transition-colors hover:text-neutral-500"
        >
          تغییر شماره موبایل
        </Link>
      </div>
    </AuthShell>
  );
}