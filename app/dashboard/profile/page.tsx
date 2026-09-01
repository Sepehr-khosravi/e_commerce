"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, MapPin, Phone, UserRound } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

type ProfileForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
};

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    refreshAuth,
  } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    });

    setLoading(false);
  }, [user]);

  const handleChange = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "ذخیره اطلاعات انجام نشد."
        );
      }

      await refreshAuth();

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "خطایی هنگام ذخیره اطلاعات رخ داد."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-black">
            برای مشاهده پروفایل وارد شوید
          </h1>

          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            ورود
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 transition-colors hover:text-black"
          >
            <ArrowRight size={14} />
            بازگشت به داشبورد
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Profile
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl">
              اطلاعات حساب
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              اطلاعات شخصی و آدرس خود را مدیریت کنید.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <section className="overflow-hidden rounded-3xl border border-neutral-100 bg-white">

          {/* Profile heading */}
          <div className="flex items-center gap-4 border-b border-neutral-100 p-6 sm:p-8">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-lg font-bold text-white">
              {user.firstName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h2 className="font-bold text-black">
                {user.firstName} {user.lastName}
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                {user.phoneNumber}
              </p>
            </div>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8"
          >

            <div className="grid gap-5 sm:grid-cols-2">

              <InputField
                label="نام"
                value={form.firstName}
                onChange={(value) =>
                  handleChange("firstName", value)
                }
                icon={<UserRound size={16} />}
              />

              <InputField
                label="نام خانوادگی"
                value={form.lastName}
                onChange={(value) =>
                  handleChange("lastName", value)
                }
              />

              {/* Phone */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-neutral-600">
                  شماره موبایل
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl bg-neutral-50 px-4 text-sm text-neutral-400">
                  <Phone size={16} />

                  <span dir="ltr">
                    {form.phoneNumber}
                  </span>

                  <span className="mr-auto rounded-full bg-neutral-200 px-2.5 py-1 text-[9px] font-bold text-neutral-500">
                    قابل تغییر نیست
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-neutral-600">
                  آدرس
                </label>

                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute right-4 top-4 text-neutral-400"
                  />

                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      handleChange(
                        "address",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="آدرس خود را وارد کنید..."
                    className="w-full resize-none rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-11 text-sm leading-6 outline-none transition-all duration-200 placeholder:text-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-3 text-xs font-semibold text-black">
                <Check size={15} />
                اطلاعات با موفقیت ذخیره شد.
              </div>
            )}

            {/* Submit */}
            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex h-12 min-w-36 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-semibold text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    در حال ذخیره
                  </>
                ) : (
                  "ذخیره تغییرات"
                )}
              </button>
            </div>

          </form>
        </section>
      </div>
    </main>
  );
}


function InputField({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-neutral-600">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </span>
        )}

        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-12 w-full rounded-xl border border-neutral-200 bg-white text-sm outline-none transition-all duration-200 placeholder:text-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 ${
            icon ? "pr-11 pl-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}


function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />

        <div className="mt-6 overflow-hidden rounded-3xl bg-white">
          <div className="h-28 animate-pulse bg-neutral-100" />

          <div className="space-y-5 p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="h-12 animate-pulse rounded-xl bg-neutral-100" />
              <div className="h-12 animate-pulse rounded-xl bg-neutral-100" />
            </div>

            <div className="h-12 animate-pulse rounded-xl bg-neutral-100" />
            <div className="h-32 animate-pulse rounded-xl bg-neutral-100" />
          </div>
        </div>
      </div>
    </main>
  );
}