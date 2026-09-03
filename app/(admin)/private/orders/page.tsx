"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

type Product = {
  id: number;
  title: string;
  images: string[];
  price: number | string;
};

type OrderItem = {
  id: number;
  quantity: number;
  price: number | string;
  product: Product;
};

type User = {
  id: number;
  phoneNumber: string;
  firstName: string | null;
  lastName: string | null;
};

type Order = {
  id: number;
  userId: number;

  firstName: string;
  lastName: string;
  phone: string;
  address: string;

  totalPrice: number | string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  createdAt?: string;
  updatedAt?: string;

  user?: User | null;

  items: OrderItem[];
};

type OrdersResponse = {
  orders?: Order[];
  nextCursor?: number | null;
  hasNextPage?: boolean;
};

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  string
> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
};

const PAYMENT_STATUS_LABELS: Record<
  PaymentStatus,
  string
> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  FAILED: "ناموفق",
  REFUNDED: "بازگشت وجه",
};

function formatPrice(value: number | string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "۰";
  }

  return new Intl.NumberFormat("fa-IR").format(
    number
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getCustomerName(order: Order) {
  const name =
    `${order.firstName ?? ""} ${
      order.lastName ?? ""
    }`.trim();

  return name || "کاربر بدون نام";
}

function getStatusLabel(
  status: OrderStatus
) {
  return ORDER_STATUS_LABELS[status];
}

function getPaymentStatusLabel(
  status: PaymentStatus
) {
  return PAYMENT_STATUS_LABELS[status];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] = useState<
    OrderStatus | "ALL"
  >("ALL");

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState<PaymentStatus | "ALL">(
    "ALL"
  );

  const [nextCursor, setNextCursor] =
    useState<number | null>(null);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const [cursorHistory, setCursorHistory] =
    useState<(number | null)[]>([null]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  async function loadOrders(
    cursor: number | null = null,
    options?: {
      showLoading?: boolean;
      page?: number;
    }
  ) {
    try {
      if (options?.showLoading !== false) {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      params.set("limit", "20");

      if (cursor !== null) {
        params.set(
          "cursor",
          String(cursor)
        );
      }

      if (status !== "ALL") {
        params.set(
          "status",
          status
        );
      }

      if (paymentStatus !== "ALL") {
        params.set(
          "paymentStatus",
          paymentStatus
        );
      }

      const response = await fetch(
        `/api/admin/orders?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const text =
        await response.text();

      let data: OrdersResponse & {
        error?: string;
      } = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "پاسخ سرور JSON معتبر نیست."
        );
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "دسترسی به پنل مدیریت سفارش‌ها ندارید."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "دریافت سفارش‌ها ناموفق بود."
        );
      }

      setOrders(data.orders ?? []);

      setNextCursor(
        data.nextCursor ?? null
      );

      setHasNextPage(
        data.hasNextPage ?? false
      );

      if (options?.page) {
        setCurrentPage(
          options.page
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داده است."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
    setCursorHistory([null]);

    loadOrders(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paymentStatus]);

  async function handleRefresh() {
    setRefreshing(true);

    const currentCursor =
      cursorHistory[
        currentPage - 1
      ] ?? null;

    await loadOrders(
      currentCursor,
      {
        showLoading: false,
      }
    );
  }

  async function openOrder(
    orderId: number
  ) {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const text =
        await response.text();

      let data: {
        order?: Order;
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

      if (!response.ok) {
        throw new Error(
          data.error ||
            "دریافت سفارش ناموفق بود."
        );
      }

      if (!data.order) {
        throw new Error(
          "اطلاعات سفارش دریافت نشد."
        );
      }

      setSelectedOrder(
        data.order
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "خطا در دریافت سفارش."
      );
    } finally {
      setDetailsLoading(false);
    }
  }
  async function updateOrder(
    orderId: number,
    data: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    }
  ): Promise<Order | null> {
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
  
      const text = await response.text();
  
      let result: {
        order?: Order;
        error?: string;
      } = {};
  
      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "پاسخ سرور معتبر نیست."
        );
      }
  
      if (!response.ok) {
        throw new Error(
          result.error ||
            "به‌روزرسانی سفارش ناموفق بود."
        );
      }
  
      if (!result.order) {
        throw new Error(
          "اطلاعات سفارش از سرور دریافت نشد."
        );
      }
  
      return result.order;
    } catch (error) {
      console.error(error);
  
      alert(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد."
      );
  
      return null;
    }
  }
  async function handleNextPage() {
    if (
      !hasNextPage ||
      nextCursor === null
    ) {
      return;
    }

    const nextPage =
      currentPage + 1;

    setCursorHistory(
      (current) => [
        ...current,
        nextCursor,
      ]
    );

    await loadOrders(
      nextCursor,
      {
        page: nextPage,
      }
    );
  }

  async function handlePreviousPage() {
    if (currentPage <= 1) {
      return;
    }

    const previousPage =
      currentPage - 1;

    const previousCursor =
      cursorHistory[
        previousPage - 1
      ] ?? null;

    await loadOrders(
      previousCursor,
      {
        page: previousPage,
      }
    );
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch =
      search
        .trim()
        .toLowerCase();

    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter(
      (order) => {
        const customerName =
          getCustomerName(
            order
          ).toLowerCase();

        const phone =
          order.phone?.toLowerCase() ??
          "";

        const orderId =
          String(order.id);

        return (
          customerName.includes(
            normalizedSearch
          ) ||
          phone.includes(
            normalizedSearch
          ) ||
          orderId.includes(
            normalizedSearch
          )
        );
      }
    );
  }, [orders, search]);

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.status ===
          "PENDING"
      ).length,

      processing: orders.filter(
        (order) =>
          order.status ===
          "PROCESSING"
      ).length,

      delivered: orders.filter(
        (order) =>
          order.status ===
          "DELIVERED"
      ).length,
    };
  }, [orders]);

  if (loading) {
    return <OrdersSkeleton />;
  }

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 p-5 sm:p-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
            <ShoppingBag
              size={34}
              className="mx-auto text-neutral-300"
            />

            <h1 className="mt-4 text-lg font-bold text-black">
              {error}
            </h1>

            <button
              onClick={() =>
                loadOrders(null)
              }
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              <RefreshCw size={16} />
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

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-black">
              سفارش‌ها
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              مدیریت سفارش‌ها و وضعیت پرداخت مشتریان
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            بروزرسانی
          </button>
        </div>

        {/* Stats */}

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="سفارش‌های این صفحه"
            value={stats.total}
          />

          <StatCard
            title="در انتظار"
            value={stats.pending}
          />

          <StatCard
            title="در حال پردازش"
            value={stats.processing}
          />

          <StatCard
            title="تحویل شده"
            value={stats.delivered}
          />
        </div>

        {/* Filters */}

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            {/* Search */}

            <div className="relative flex-1">
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
                placeholder="جستجو با نام، شماره تلفن یا شماره سفارش..."
                className="h-11 w-full rounded-xl bg-neutral-50 pr-11 pl-4 text-sm outline-none transition focus:bg-neutral-100"
              />
            </div>

            {/* Order Status */}

            <div className="relative">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | OrderStatus
                      | "ALL"
                  )
                }
                className="h-11 min-w-44 appearance-none rounded-xl bg-neutral-50 px-4 pl-10 text-sm outline-none transition focus:bg-neutral-100"
              >
                <option value="ALL">
                  همه وضعیت سفارش
                </option>

                {ORDER_STATUSES.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {
                        ORDER_STATUS_LABELS[
                          item
                        ]
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>

            {/* Payment Status */}

            <div className="relative">
              <select
                value={
                  paymentStatus
                }
                onChange={(event) =>
                  setPaymentStatus(
                    event.target
                      .value as
                      | PaymentStatus
                      | "ALL"
                  )
                }
                className="h-11 min-w-44 appearance-none rounded-xl bg-neutral-50 px-4 pl-10 text-sm outline-none transition focus:bg-neutral-100"
              >
                <option value="ALL">
                  همه وضعیت پرداخت
                </option>

                {PAYMENT_STATUSES.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {
                        PAYMENT_STATUS_LABELS[
                          item
                        ]
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
          </div>
        </div>

        {/* Orders */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {/* Desktop */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-right">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    سفارش
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    مشتری
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    مبلغ
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    وضعیت سفارش
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    پرداخت
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    تاریخ
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    عملیات
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onOpen={() =>
                        openOrder(
                          order.id
                        )
                      }
                    />
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}

          <div className="divide-y divide-neutral-100 lg:hidden">
            {filteredOrders.map(
              (order) => (
                <OrderMobileCard
                  key={order.id}
                  order={order}
                  onOpen={() =>
                    openOrder(
                      order.id
                    )
                  }
                />
              )
            )}
          </div>

          {filteredOrders.length ===
            0 && (
            <div className="px-6 py-20 text-center">
              <ShoppingBag
                size={30}
                className="mx-auto text-neutral-300"
              />

              <p className="mt-4 text-sm font-semibold text-neutral-500">
                سفارشی پیدا نشد
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3">
          <button
            onClick={
              handlePreviousPage
            }
            disabled={
              currentPage <= 1
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-50 px-4 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight
              size={15}
            />
            قبلی
          </button>

          <span className="text-xs font-bold text-neutral-500">
            صفحه{" "}
            {new Intl.NumberFormat(
              "fa-IR"
            ).format(currentPage)}
          </span>

          <button
            onClick={
              handleNextPage
            }
            disabled={
              !hasNextPage ||
              nextCursor === null
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            بعدی
            <ChevronLeft
              size={15}
            />
          </button>
        </div>
      </div>

      {/* Details Modal */}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() =>
            setSelectedOrder(null)
          }
          onUpdate={updateOrder}
        />
      )}

      {/* Detail Loading */}

      {detailsLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl">
            <Loader2
              size={20}
              className="animate-spin text-black"
            />
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium text-neutral-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-black">
        {new Intl.NumberFormat(
          "fa-IR"
        ).format(value)}
      </p>
    </div>
  );
}

function OrderRow({
  order,
  onOpen,
}: {
  order: Order;
  onOpen: () => void;
}) {
  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-bold text-black">
            سفارش #
            {new Intl.NumberFormat(
              "fa-IR"
            ).format(order.id)}
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            {new Intl.NumberFormat(
              "fa-IR"
            ).format(
              order.items?.length ??
                0
            )}{" "}
            قلم
          </p>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
            <User
              size={15}
              className="text-neutral-400"
            />
          </div>

          <div>
            <p className="max-w-40 truncate text-sm font-semibold text-black">
              {getCustomerName(
                order
              )}
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              {order.phone}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <p className="text-sm font-bold text-black">
          {formatPrice(
            order.totalPrice
          )}{" "}
          تومان
        </p>
      </td>

      <td className="px-6 py-4">
        <OrderStatusBadge
          status={order.status}
        />
      </td>

      <td className="px-6 py-4">
        <PaymentStatusBadge
          status={
            order.paymentStatus
          }
        />
      </td>

      <td className="px-6 py-4">
        <p className="text-xs font-medium text-neutral-500">
          {formatDate(
            order.createdAt
          )}
        </p>
      </td>

      <td className="px-6 py-4">
        <button
          onClick={onOpen}
          className="flex h-9 items-center gap-2 rounded-lg bg-neutral-100 px-3 text-xs font-semibold text-neutral-600 transition hover:bg-black hover:text-white"
        >
          <Eye size={14} />
          جزئیات
        </button>
      </td>
    </tr>
  );
}

function OrderMobileCard({
  order,
  onOpen,
}: {
  order: Order;
  onOpen: () => void;
}) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-black">
            سفارش #
            {new Intl.NumberFormat(
              "fa-IR"
            ).format(order.id)}
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            {getCustomerName(
              order
            )}
          </p>
        </div>

        <OrderStatusBadge
          status={order.status}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-[10px] text-neutral-400">
            مبلغ
          </p>

          <p className="mt-1 text-xs font-bold text-black">
            {formatPrice(
              order.totalPrice
            )}{" "}
            تومان
          </p>
        </div>

        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-[10px] text-neutral-400">
            پرداخت
          </p>

          <div className="mt-1">
            <PaymentStatusBadge
              status={
                order.paymentStatus
              }
            />
          </div>
        </div>

        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-[10px] text-neutral-400">
            کالاها
          </p>

          <p className="mt-1 text-xs font-bold text-black">
            {new Intl.NumberFormat(
              "fa-IR"
            ).format(
              order.items?.length ??
                0
            )}{" "}
            قلم
          </p>
        </div>

        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-[10px] text-neutral-400">
            تاریخ
          </p>

          <p className="mt-1 truncate text-xs font-bold text-black">
            {formatDate(
              order.createdAt
            )}
          </p>
        </div>
      </div>

      <button
        onClick={onOpen}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-black text-xs font-semibold text-white"
      >
        <Eye size={14} />
        مشاهده جزئیات سفارش
      </button>
    </div>
  );
}

function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">
      <span className="h-1.5 w-1.5 rounded-full bg-black" />

      {getStatusLabel(status)}
    </span>
  );
}

function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">
      <span className="h-1.5 w-1.5 rounded-full bg-black" />

      {getPaymentStatusLabel(
        status
      )}
    </span>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (
    orderId: number,
    data: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    }
  ) => Promise<Order | null>;
}) {
  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    updatingPayment,
    setUpdatingPayment,
  ] = useState(false);

  async function changeStatus(
    status: OrderStatus
  ) {
    if (status === order.status) {
      return;
    }

    try {
      setUpdatingStatus(true);

      await onUpdate(
        order.id,
        {
          status,
        }
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function changePaymentStatus(
    paymentStatus: PaymentStatus
  ) {
    if (
      paymentStatus ===
      order.paymentStatus
    ) {
      return;
    }

    try {
      setUpdatingPayment(true);

      await onUpdate(
        order.id,
        {
          paymentStatus,
        }
      );
    } finally {
      setUpdatingPayment(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        dir="rtl"
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold text-neutral-400">
              ORDER DETAILS
            </p>

            <h2 className="mt-1 text-xl font-bold text-black">
              سفارش #
              {new Intl.NumberFormat(
                "fa-IR"
              ).format(order.id)}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-black"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Customer */}

          <section>
            <SectionTitle>
              اطلاعات مشتری
            </SectionTitle>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox
                label="نام"
                value={getCustomerName(
                  order
                )}
              />

              <InfoBox
                label="شماره تماس"
                value={
                  order.phone ||
                  "—"
                }
              />

              <InfoBox
                label="شناسه کاربر"
                value={new Intl.NumberFormat(
                  "fa-IR"
                ).format(
                  order.userId
                )}
              />

              <InfoBox
                label="تاریخ ثبت"
                value={formatDate(
                  order.createdAt
                )}
              />

              <div className="sm:col-span-2">
                <InfoBox
                  label="آدرس"
                  value={
                    order.address ||
                    "آدرسی ثبت نشده است."
                  }
                />
              </div>
            </div>
          </section>

          {/* Status */}

          <section>
            <SectionTitle>
              وضعیت سفارش
            </SectionTitle>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 p-4">
                <p className="text-xs font-semibold text-neutral-400">
                  وضعیت سفارش
                </p>

                <div className="relative mt-3">
                  <select
                    value={order.status}
                    disabled={
                      updatingStatus
                    }
                    onChange={(event) =>
                      changeStatus(
                        event.target
                          .value as OrderStatus
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl bg-neutral-50 px-4 pl-10 text-sm font-semibold outline-none transition focus:bg-neutral-100 disabled:opacity-50"
                  >
                    {ORDER_STATUSES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {
                            ORDER_STATUS_LABELS[
                              item
                            ]
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  {updatingStatus && (
                    <Loader2
                      size={15}
                      className="absolute left-9 top-1/2 -translate-y-1/2 animate-spin"
                    />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-4">
                <p className="text-xs font-semibold text-neutral-400">
                  وضعیت پرداخت
                </p>

                <div className="relative mt-3">
                  <select
                    value={
                      order.paymentStatus
                    }
                    disabled={
                      updatingPayment
                    }
                    onChange={(event) =>
                      changePaymentStatus(
                        event.target
                          .value as PaymentStatus
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl bg-neutral-50 px-4 pl-10 text-sm font-semibold outline-none transition focus:bg-neutral-100 disabled:opacity-50"
                  >
                    {PAYMENT_STATUSES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {
                            PAYMENT_STATUS_LABELS[
                              item
                            ]
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  {updatingPayment && (
                    <Loader2
                      size={15}
                      className="absolute left-9 top-1/2 -translate-y-1/2 animate-spin"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Payment Demo */}

          <section>
            <SectionTitle>
              درگاه پرداخت
            </SectionTitle>

            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-black">
                    لینک پرداخت
                  </p>

                  <p className="mt-1 text-xs leading-6 text-neutral-400">
                    درگاه واقعی هنوز متصل نشده است.
                    این بخش برای نمایش نمونه‌کار آماده شده.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-neutral-400 shadow-sm"
                >
                  <ExternalLink
                    size={14}
                  />
                  مشاهده لینک پرداخت
                </button>
              </div>
            </div>
          </section>

          {/* Items */}

          <section>
            <SectionTitle>
              کالاهای سفارش
            </SectionTitle>

            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <div className="divide-y divide-neutral-100">
                {order.items?.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {item.product
                          ?.images?.[0] ? (
                          <img
                            src={
                              item
                                .product
                                .images[0]
                            }
                            alt={
                              item
                                .product
                                .title
                            }
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package
                              size={
                                18
                              }
                              className="text-neutral-300"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-black">
                          {
                            item
                              .product
                              ?.title
                          }
                        </p>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
                          <span>
                            تعداد:{" "}
                            {new Intl.NumberFormat(
                              "fa-IR"
                            ).format(
                              item.quantity
                            )}
                          </span>

                          <span>
                            قیمت واحد:{" "}
                            {formatPrice(
                              item.price
                            )}{" "}
                            تومان
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-left">
                        <p className="text-sm font-bold text-black">
                          {formatPrice(
                            Number(
                              item.price
                            ) *
                              item.quantity
                          )}{" "}
                          تومان
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="border-t border-neutral-100 bg-neutral-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-500">
                    مبلغ نهایی
                  </span>

                  <span className="text-lg font-bold text-black">
                    {formatPrice(
                      order.totalPrice
                    )}{" "}
                    تومان
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom */}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="h-11 rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="text-sm font-bold text-black">
        {children}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <p className="text-[10px] font-medium text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold leading-6 text-black">
        {value}
      </p>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50"
    >
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-neutral-200" />

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
              className="h-24 animate-pulse border-b border-neutral-100 bg-neutral-100"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
