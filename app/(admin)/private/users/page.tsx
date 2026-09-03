"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Search,
  Shield,
  ShoppingBag,
  Star,
  Users,
  UserRound,
  X,
} from "lucide-react";

type UserRole = "ADMIN" | "CUSTOMER";

type User = {
  id: number;
  phoneNumber: string;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  role: UserRole;
  createdAt: string;
  _count: {
    orders: number;
    favorites: number;
  };
};

type UsersResponse = {
  users?: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  error?: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function getUserName(user: User) {
  const name = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "کاربر بدون نام";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState<UsersResponse["pagination"]>();

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  async function loadUsers(
    targetPage = page,
    targetQuery = search
  ) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set(
        "page",
        String(targetPage)
      );

      params.set("limit", "20");

      if (targetQuery.trim()) {
        params.set(
          "query",
          targetQuery.trim()
        );
      }

      const response = await fetch(
        `/api/admin/users?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const text =
        await response.text();

      let data: UsersResponse = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "پاسخ سرور معتبر نیست."
        );
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "دسترسی به پنل مدیریت کاربران ندارید."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "دریافت کاربران ناموفق بود."
        );
      }

      setUsers(data.users ?? []);
      setPagination(
        data.pagination
      );
      setPage(targetPage);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(1, "");
  }, []);

  /*
   * Search
   *
   * برای اینکه با هر تایپ درخواست ارسال نشود،
   * کمی صبر می‌کنیم.
   */

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers(1, search);
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  const statistics = useMemo(() => {
    const admins = users.filter(
      (user) => user.role === "ADMIN"
    ).length;

    const customers = users.filter(
      (user) => user.role === "CUSTOMER"
    ).length;

    const orders = users.reduce(
      (sum, user) =>
        sum + user._count.orders,
      0
    );

    return {
      admins,
      customers,
      orders,
    };
  }, [users]);

  if (loading && users.length === 0) {
    return <UsersSkeleton />;
  }

  if (error && users.length === 0) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 p-5 sm:p-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
            <Users
              size={34}
              className="mx-auto text-neutral-300"
            />

            <h1 className="mt-4 text-lg font-bold text-black">
              {error}
            </h1>

            <button
              onClick={() =>
                loadUsers(1, search)
              }
              className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              تلاش دوباره
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50"
    >
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        {/* Header */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-black">
              کاربران
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              مدیریت کاربران فروشگاه
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-neutral-500 shadow-sm ring-1 ring-neutral-200">
            <Users size={15} />

            {pagination
              ? formatNumber(
                  pagination.total
                )
              : "۰"}{" "}
            کاربر
          </div>
        </div>

        {/* Stats */}

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="کل کاربران"
            value={
              pagination?.total ?? 0
            }
            icon={<Users size={17} />}
          />

          <StatCard
            title="ادمین‌ها"
            value={statistics.admins}
            icon={
              <Shield size={17} />
            }
          />

          <StatCard
            title="مشتری‌ها"
            value={
              pagination
                ? pagination.total -
                  statistics.admins
                : statistics.customers
            }
            icon={
              <UserRound size={17} />
            }
          />

          <StatCard
            title="سفارش‌های صفحه"
            value={statistics.orders}
            icon={
              <ShoppingBag size={17} />
            }
          />
        </div>

        {/* Search */}

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="relative">
            <Search
              size={17}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="جستجو بر اساس نام، نام خانوادگی یا شماره موبایل..."
              className="h-12 w-full rounded-xl bg-neutral-50 pr-11 pl-12 text-sm outline-none transition placeholder:text-neutral-400 focus:bg-neutral-100"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-200 hover:text-black"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Users */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {/* Desktop */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-right">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    کاربر
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    شماره موبایل
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    نقش
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    سفارش‌ها
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    علاقه‌مندی‌ها
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    عضویت
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    عملیات
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={() =>
                      setSelectedUser(
                        user
                      )
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}

          <div className="divide-y divide-neutral-100 lg:hidden">
            {users.map((user) => (
              <UserMobileCard
                key={user.id}
                user={user}
                onEdit={() =>
                  setSelectedUser(user)
                }
              />
            ))}
          </div>

          {users.length === 0 && (
            <div className="px-6 py-20 text-center">
              <Users
                size={32}
                className="mx-auto text-neutral-300"
              />

              <p className="mt-4 text-sm font-semibold text-neutral-500">
                کاربری پیدا نشد
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                عبارت جستجو را تغییر دهید.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}

        {pagination &&
          pagination.totalPages > 1 && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-neutral-400">
                صفحه{" "}
                <span className="font-bold text-black">
                  {formatNumber(
                    pagination.page
                  )}
                </span>{" "}
                از{" "}
                <span className="font-bold text-black">
                  {formatNumber(
                    pagination.totalPages
                  )}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={
                    !pagination.hasPreviousPage ||
                    loading
                  }
                  onClick={() =>
                    loadUsers(
                      pagination.page -
                        1,
                      search
                    )
                  }
                  className="flex h-9 items-center gap-1 rounded-lg bg-neutral-100 px-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                  قبلی
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-black px-3 text-xs font-bold text-white">
                  {formatNumber(
                    pagination.page
                  )}
                </span>

                <button
                  disabled={
                    !pagination.hasNextPage ||
                    loading
                  }
                  onClick={() =>
                    loadUsers(
                      pagination.page +
                        1,
                      search
                    )
                  }
                  className="flex h-9 items-center gap-1 rounded-lg bg-neutral-100 px-3 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  بعدی
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Edit Modal */}

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() =>
            setSelectedUser(null)
          }
          onUpdated={(updatedUser) => {
            setUsers((current) =>
              current.map((user) =>
                user.id ===
                updatedUser.id
                  ? {
                      ...user,
                      ...updatedUser,
                    }
                  : user
              )
            );

            setSelectedUser(null);
          }}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                   */
/* -------------------------------------------------------------------------- */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-400">
          {title}
        </p>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-black">
        {formatNumber(value)}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Role Badge                                                                  */
/* -------------------------------------------------------------------------- */

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  const admin = role === "ADMIN";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        admin
          ? "bg-black text-white"
          : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {admin && <Shield size={11} />}

      {admin ? "ادمین" : "مشتری"}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* User Row                                                                    */
/* -------------------------------------------------------------------------- */

function UserRow({
  user,
  onEdit,
}: {
  user: User;
  onEdit: () => void;
}) {
  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />

          <div>
            <p className="max-w-52 truncate text-sm font-bold text-black">
              {getUserName(user)}
            </p>

            <p className="mt-1 text-[10px] text-neutral-400">
              ID:{" "}
              {formatNumber(user.id)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          dir="ltr"
          className="text-sm font-medium text-neutral-600"
        >
          {user.phoneNumber}
        </span>
      </td>

      <td className="px-6 py-4">
        <RoleBadge role={user.role} />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
          <ShoppingBag
            size={14}
            className="text-neutral-400"
          />

          {formatNumber(
            user._count.orders
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
          <Star
            size={14}
            className="text-neutral-400"
          />

          {formatNumber(
            user._count.favorites
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="text-xs text-neutral-400">
          {formatDate(
            user.createdAt
          )}
        </span>
      </td>

      <td className="px-6 py-4">
        <button
          onClick={onEdit}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition hover:bg-black hover:text-white"
        >
          <Edit3 size={15} />
        </button>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                 */
/* -------------------------------------------------------------------------- */

function UserMobileCard({
  user,
  onEdit,
}: {
  user: User;
  onEdit: () => void;
}) {
  return (
    <div className="p-4">
      <div className="flex gap-3">
        <UserAvatar user={user} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-black">
                {getUserName(user)}
              </h3>

              <p
                dir="ltr"
                className="mt-1 text-left text-xs text-neutral-400"
              >
                {user.phoneNumber}
              </p>
            </div>

            <RoleBadge
              role={user.role}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat
              icon={
                <ShoppingBag
                  size={13}
                />
              }
              label="سفارش"
              value={user._count.orders}
            />

            <MiniStat
              icon={
                <Star size={13} />
              }
              label="علاقه‌مندی"
              value={
                user._count.favorites
              }
            />

            <MiniStat
              icon={
                <UserRound
                  size={13}
                />
              }
              label="شناسه"
              value={user.id}
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] text-neutral-400">
              عضویت:{" "}
              {formatDate(
                user.createdAt
              )}
            </p>

            <button
              onClick={onEdit}
              className="flex h-9 items-center gap-2 rounded-lg bg-black px-4 text-xs font-semibold text-white"
            >
              <Edit3 size={13} />
              ویرایش
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mini Stat                                                                   */
/* -------------------------------------------------------------------------- */

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-neutral-50 px-2 py-2">
      <div className="flex items-center gap-1 text-[9px] text-neutral-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 text-xs font-bold text-black">
        {formatNumber(value)}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                      */
/* -------------------------------------------------------------------------- */

function UserAvatar({
  user,
}: {
  user: User;
}) {
  const firstLetter =
    user.firstName?.trim()?.[0] ??
    user.lastName?.trim()?.[0] ??
    "؟";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-sm font-bold text-neutral-500">
      {firstLetter}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Edit Modal                                                                  */
/* -------------------------------------------------------------------------- */

function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: User;
  onClose: () => void;
  onUpdated: (user: User) => void;
}) {
  const [firstName, setFirstName] =
    useState(user.firstName ?? "");

  const [lastName, setLastName] =
    useState(user.lastName ?? "");

  const [phone, setPhone] =
    useState(user.phoneNumber);

  const [address, setAddress] =
    useState(user.address ?? "");

  const [role, setRole] =
    useState<UserRole>(user.role);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!firstName.trim()) {
        throw new Error(
          "نام نمی‌تواند خالی باشد."
        );
      }

      if (!lastName.trim()) {
        throw new Error(
          "نام خانوادگی نمی‌تواند خالی باشد."
        );
      }

      if (!phone.trim()) {
        throw new Error(
          "شماره موبایل نمی‌تواند خالی باشد."
        );
      }

      const response = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            firstName:
              firstName.trim(),

            lastName:
              lastName.trim(),

            phone: phone.trim(),

            address:
              address.trim()
                ? address.trim()
                : null,

            role,
          }),
        }
      );

      const text =
        await response.text();

      let data: {
        user?: User;
        error?: string;
      } = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "پاسخ سرور معتبر نیست."
        );
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "دسترسی به ویرایش کاربر ندارید."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "ویرایش کاربر ناموفق بود."
        );
      }

      if (!data.user) {
        throw new Error(
          "اطلاعات کاربر از سرور دریافت نشد."
        );
      }

      onUpdated(data.user);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        dir="rtl"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        {/* Header */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              User #{formatNumber(user.id)}
            </p>

            <h2 className="mt-2 text-xl font-bold text-black">
              ویرایش کاربر
            </h2>

            <p className="mt-1 text-xs text-neutral-400">
              اطلاعات حساب کاربر را مدیریت کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-black disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          {/* Name */}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="نام"
              value={firstName}
              onChange={setFirstName}
              disabled={loading}
              required
            />

            <FormInput
              label="نام خانوادگی"
              value={lastName}
              onChange={setLastName}
              disabled={loading}
              required
            />
          </div>

          {/* Phone */}

          <FormInput
            label="شماره موبایل"
            value={phone}
            onChange={setPhone}
            disabled={loading}
            dir="ltr"
            required
          />

          {/* Address */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-600">
              آدرس
            </label>

            <textarea
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value
                )
              }
              disabled={loading}
              rows={4}
              placeholder="آدرس کاربر..."
              className="w-full resize-none rounded-xl bg-neutral-50 p-4 text-sm outline-none transition focus:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Role */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-600">
              نقش کاربر
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setRole("CUSTOMER")
                }
                className={`rounded-xl border p-4 text-right transition ${
                  role === "CUSTOMER"
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserRound
                    size={16}
                  />

                  <span className="text-sm font-bold">
                    مشتری
                  </span>
                </div>

                <p
                  className={`mt-1 text-[10px] ${
                    role === "CUSTOMER"
                      ? "text-neutral-300"
                      : "text-neutral-400"
                  }`}
                >
                  دسترسی معمول فروشگاه
                </p>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setRole("ADMIN")
                }
                className={`rounded-xl border p-4 text-right transition ${
                  role === "ADMIN"
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield
                    size={16}
                  />

                  <span className="text-sm font-bold">
                    ادمین
                  </span>
                </div>

                <p
                  className={`mt-1 text-[10px] ${
                    role === "ADMIN"
                      ? "text-neutral-300"
                      : "text-neutral-400"
                  }`}
                >
                  دسترسی به پنل مدیریت
                </p>
              </button>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-12 flex-1 rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-200 disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-black text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {loading
                ? "در حال ذخیره..."
                : "ذخیره تغییرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form Input                                                                  */
/* -------------------------------------------------------------------------- */

function FormInput({
  label,
  value,
  onChange,
  disabled,
  required,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-neutral-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        required={required}
        dir={dir}
        className="h-11 w-full rounded-xl bg-neutral-50 px-4 text-sm outline-none transition focus:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

function UsersSkeleton() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50"
    >
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-neutral-200" />

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-neutral-200"
            />
          ))}
        </div>

        <div className="mt-8 h-20 animate-pulse rounded-2xl bg-neutral-200" />

        <div className="mt-5 overflow-hidden rounded-2xl bg-white">
          {Array.from({
            length: 7,
          }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse border-b border-neutral-100 bg-neutral-100"
            />
          ))}
        </div>
      </div>
    </main>
  );
}