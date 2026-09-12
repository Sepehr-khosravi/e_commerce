"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
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

import { normalizeImageUrl } from "@/app/lib/common/imageNormalizer";

/* =========================================================
   Types
========================================================= */

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

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

type ProductVariant = {
  id: number;
  color: string | null;
  count: number;
  isActive: boolean;
};

type Payment = {
  id: number;
  orderId: number;
  amount: number | string;

  /*
   * Authority is sensitive payment information.
   * It is only received from the protected admin
   * order-details endpoint.
   */
  authority: string;

  transactionId: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;

  /*
   * Selected product variant.
   *
   * For products with colors, this points to the
   * exact color selected by the customer.
   */
  variantId: number | null;

  productTitle: string;
  productPrice: number | string;
  productOffer: number | string;

  quantity: number;
  totalPrice: number | string;

  createdAt: string;

  product?: Product | null;

  /*
   * Returned by the protected admin order-details API.
   */
  variant?: ProductVariant | null;
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

  /*
   * A single order can have multiple payment attempts.
   */
  payments: Payment[];
};

type OrdersResponse = {
  orders?: Order[];
  nextCursor?: number | null;
  hasMore?: boolean;
  hasNextPage?: boolean;
};

type ApiErrorResponse = {
  error?: string;
};

/* =========================================================
   Constants
========================================================= */

const DEFAULT_LIMIT = 10;

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
  REFUNDED: "بازپرداخت شده",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  FAILED: "ناموفق",
  REFUNDED: "بازگشت وجه",
};

/*
 * This is only used to open an already-created payment attempt.
 *
 * IMPORTANT:
 * The frontend should not use this value to verify payment.
 * Payment verification must remain completely server-side.
 */
const ZARINPAL_BASE_URL =
  "https://sandbox.zarinpal.com";

/* =========================================================
   Helpers
========================================================= */

function formatPrice(value: number | string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "۰";
  }

  return new Intl.NumberFormat("fa-IR").format(
    number
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(
    value
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
  const name = `${order.firstName ?? ""} ${
    order.lastName ?? ""
  }`.trim();

  return name || "کاربر بدون نام";
}

function getStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status];
}

function getPaymentStatusLabel(
  status: PaymentStatus
) {
  return PAYMENT_STATUS_LABELS[status];
}

function getPaymentUrl(authority: string) {
  if (
    typeof authority !== "string" ||
    !authority.trim()
  ) {
    return null;
  }

  return `${ZARINPAL_BASE_URL}/pg/StartPay/${encodeURIComponent(
    authority.trim()
  )}`;
}

/* =========================================================
   Main Page
========================================================= */

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<
    OrderStatus | "ALL"
  >("ALL");

  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus | "ALL">("ALL");

  /*
   * Backend currently returns a numeric cursor.
   */
  const [nextCursor, setNextCursor] = useState<
    number | null
  >(null);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  /*
   * cursorHistory[0] = null
   * means first page.
   *
   * cursorHistory[n] = cursor used to request
   * page n + 1.
   */
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

  /*
   * Used to prevent an older request from overwriting
   * newer filter/page state.
   */
  const requestVersionRef = useRef(0);

  /* =========================================================
     Load Orders
  ========================================================= */

  async function loadOrders(
    cursor: number | null = null,
    options?: {
      showLoading?: boolean;
      page?: number;
    }
  ) {
    const requestVersion =
      ++requestVersionRef.current;

    try {
      if (options?.showLoading !== false) {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      params.set(
        "limit",
        String(DEFAULT_LIMIT)
      );

      if (cursor !== null) {
        params.set(
          "cursor",
          String(cursor)
        );
      }

      if (status !== "ALL") {
        params.set("status", status);
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
          credentials: "same-origin",
        }
      );

      const text =
        await response.text();

      let data: OrdersResponse &
        ApiErrorResponse = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "پاسخ سرور JSON معتبر نیست."
        );
      }

      /*
       * Ignore only genuinely older requests.
       */
      if (
        requestVersion !==
        requestVersionRef.current
      ) {
        return;
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

      const receivedOrders =
        Array.isArray(data.orders)
          ? data.orders
          : [];

      setOrders(receivedOrders);

      setNextCursor(
        data.nextCursor ?? null
      );

      setHasNextPage(
        data.hasMore ??
          data.hasNextPage ??
          false
      );

      if (options?.page !== undefined) {
        setCurrentPage(options.page);
      }
    } catch (error) {
      console.error(
        "Admin orders load error:",
        error
      );

      if (
        requestVersion !==
        requestVersionRef.current
      ) {
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داده است."
      );
    } finally {
      if (
        requestVersion ===
        requestVersionRef.current
      ) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  /* =========================================================
     Filters
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
    setCursorHistory([null]);

    loadOrders(null, {
      page: 1,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    status,
    paymentStatus,
  ]);

  /* =========================================================
     Refresh
  ========================================================= */

  async function handleRefresh() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    const currentCursor =
      cursorHistory[
        currentPage - 1
      ] ?? null;

    await loadOrders(
      currentCursor,
      {
        showLoading: false,
        page: currentPage,
      }
    );
  }

  /* =========================================================
     Open Order
  ========================================================= */

  async function openOrder(
    orderId: number
  ) {
    /*
     * Basic client-side validation.
     *
     * The actual authorization MUST happen
     * inside /api/admin/orders/[id].
     */
    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return;
    }

    try {
      setDetailsLoading(true);

      setError("");

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
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

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "دسترسی به جزئیات سفارش ندارید."
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
      console.error(
        "Admin order details error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "خطا در دریافت سفارش."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  /* =========================================================
     Update Order
  ========================================================= */

  async function updateOrder(
    orderId: number,
    data: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    }
  ): Promise<Order | null> {
    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return null;
    }

    /*
     * Never trust the values from the UI.
     * The API must validate status transitions and
     * permissions again on the server.
     */
    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(data),
        }
      );

      const text =
        await response.text();

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

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "دسترسی برای تغییر سفارش ندارید."
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

      /*
       * Only use the server response to update UI.
       */
      setOrders((current) =>
        current.map((item) =>
          item.id === orderId
            ? result.order!
            : item
        )
      );

      setSelectedOrder((current) =>
        current?.id === orderId
          ? result.order!
          : current
      );

      return result.order;
    } catch (error) {
      console.error(
        "Admin order update error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد."
      );

      return null;
    }
  }

  /* =========================================================
     Pagination
  ========================================================= */

  async function handleNextPage() {
    if (
      !hasNextPage ||
      nextCursor === null ||
      loading
    ) {
      return;
    }

    const nextPage =
      currentPage + 1;

    /*
     * The cursor returned by the current page
     * becomes the cursor used to request the next page.
     */
    const nextCursorValue =
      nextCursor;

    setCursorHistory(
      (current) => {
        const next = [
          ...current,
        ];

        next[nextPage - 1] =
          nextCursorValue;

        return next;
      }
    );

    await loadOrders(
      nextCursorValue,
      {
        page: nextPage,
      }
    );
  }

  async function handlePreviousPage() {
    if (
      currentPage <= 1 ||
      loading
    ) {
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

  /* =========================================================
     Search
  ========================================================= */

  /*
   * Search is intentionally client-side over the CURRENT page.
   *
   * It does NOT download every order from the database.
   *
   * If you later want global search across all orders,
   * add a search parameter to the protected admin API.
   */
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
  }, [
    orders,
    search,
  ]);

  /* =========================================================
     Stats
  ========================================================= */

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

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return <OrdersSkeleton />;
  }

  /* =========================================================
     Error
  ========================================================= */

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

  /* =========================================================
     Render
  ========================================================= */

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
                placeholder="جستجو در سفارش‌های این صفحه..."
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
                value={paymentStatus}
                onChange={(event) =>
                  setPaymentStatus(
                    event.target.value as
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

          {filteredOrders.length === 0 && (
            <div className="px-6 py-20 text-center">
              <ShoppingBag
                size={30}
                className="mx-auto text-neutral-300"
              />

              <p className="mt-4 text-sm font-semibold text-neutral-500">
                سفارشی در این صفحه پیدا نشد
              </p>

              {search && (
                <p className="mt-2 text-xs text-neutral-400">
                  جستجو فقط روی سفارش‌های همین صفحه انجام می‌شود.
                </p>
              )}
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
              currentPage <= 1 ||
              loading
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-50 px-4 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={15} />
            قبلی
          </button>

          <span className="text-xs font-bold text-neutral-500">
            صفحه{" "}
            {formatNumber(
              currentPage
            )}
          </span>

          <button
            onClick={
              handleNextPage
            }
            disabled={
              !hasNextPage ||
              nextCursor === null ||
              loading
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            بعدی
            <ChevronLeft size={15} />
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

/* =========================================================
   Stat Card
========================================================= */

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
        {formatNumber(value)}
      </p>
    </div>
  );
}

/* =========================================================
   Desktop Order Row
========================================================= */

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
            {formatNumber(
              order.id
            )}
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            {formatNumber(
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

/* =========================================================
   Mobile Order Card
========================================================= */

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
            {formatNumber(
              order.id
            )}
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
            {formatNumber(
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

/* =========================================================
   Status Badges
========================================================= */

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

/* =========================================================
   Order Details Modal
========================================================= */

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
  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [updatingPayment, setUpdatingPayment] =
    useState(false);

  /*
   * Find the latest payment attempt.
   *
   * This is only presentation logic.
   * Payment state itself comes from the backend.
   */
  const latestPayment =
    order.payments?.length
      ? [...order.payments].sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        )[0]
      : null;

  /*
   * We only construct the payment URL for
   * a pending payment attempt.
   *
   * The backend remains responsible for payment
   * creation and verification.
   */
  const paymentUrl =
    latestPayment?.status ===
      "PENDING" &&
    latestPayment.authority
      ? getPaymentUrl(
          latestPayment.authority
        )
      : null;

  const canOpenPayment =
    !!paymentUrl;

  /* =========================================================
     Change Order Status
  ========================================================= */

  async function changeStatus(
    nextStatus: OrderStatus
  ) {
    if (
      nextStatus ===
      order.status
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);

      await onUpdate(
        order.id,
        {
          status: nextStatus,
        }
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  /* =========================================================
     Change Payment Status
  ========================================================= */

  async function changePaymentStatus(
    nextPaymentStatus: PaymentStatus
  ) {
    if (
      nextPaymentStatus ===
      order.paymentStatus
    ) {
      return;
    }

    try {
      setUpdatingPayment(true);

      await onUpdate(
        order.id,
        {
          paymentStatus:
            nextPaymentStatus,
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
              {formatNumber(
                order.id
              )}
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
                value={formatNumber(
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

              {/* Order Status */}

              <div className="rounded-2xl border border-neutral-200 p-4">
                <p className="text-xs font-semibold text-neutral-400">
                  وضعیت سفارش
                </p>

                <div className="relative mt-3">
                  <select
                    value={
                      order.status
                    }
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

              {/* Payment Status */}

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

          {/* Payment */}

          <section>
            <SectionTitle>
              درگاه پرداخت
            </SectionTitle>

            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4">

              {/* PAID */}

              {latestPayment?.status ===
              "PAID" ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <CheckCircle2
                          size={16}
                          className="text-green-600"
                        />
                      </div>

                      <p className="text-sm font-bold text-green-700">
                        پرداخت موفق
                      </p>
                    </div>

                    {latestPayment.transactionId && (
                      <p className="mt-2 text-xs text-neutral-400">
                        شناسه تراکنش:{" "}
                        <span className="font-semibold text-neutral-600">
                          {
                            latestPayment.transactionId
                          }
                        </span>
                      </p>
                    )}

                    {latestPayment.authority && (
                      <p className="mt-1 break-all text-xs text-neutral-400">
                        Authority:{" "}
                        <span className="font-mono text-[11px] text-neutral-500">
                          {
                            latestPayment.authority
                          }
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-neutral-400">
                      مبلغ پرداخت شده
                    </p>

                    <p className="mt-1 text-sm font-bold text-black">
                      {formatPrice(
                        latestPayment.amount
                      )}{" "}
                      تومان
                    </p>

                    {latestPayment.paidAt && (
                      <p className="mt-1 text-[11px] text-neutral-400">
                        {formatDate(
                          latestPayment.paidAt
                        )}
                      </p>
                    )}
                  </div>
                </div>

              /* PENDING */

              ) : latestPayment?.status ===
                "PENDING" ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-bold text-black">
                      پرداخت در انتظار
                    </p>

                    <p className="mt-1 text-xs leading-6 text-neutral-400">
                      این پرداخت هنوز تکمیل
                      نشده است. می‌توانید
                      لینک درگاه را باز کنید.
                    </p>

                    {latestPayment.authority && (
                      <p className="mt-2 break-all font-mono text-[10px] text-neutral-400">
                        Authority:{" "}
                        {
                          latestPayment.authority
                        }
                      </p>
                    )}
                  </div>

                  {canOpenPayment ? (
                    <a
                      href={
                        paymentUrl!
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
                    >
                      <ExternalLink
                        size={14}
                      />
                      مشاهده لینک پرداخت
                    </a>
                  ) : (
                    <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-white px-4 text-xs font-semibold text-neutral-400 shadow-sm">
                      لینک پرداخت موجود نیست
                    </span>
                  )}
                </div>

              /* FAILED */

              ) : latestPayment?.status ===
                "FAILED" ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-bold text-red-600">
                      پرداخت ناموفق
                    </p>

                    <p className="mt-1 text-xs leading-6 text-neutral-400">
                      این تلاش پرداخت ناموفق
                      بوده و قابل استفاده
                      مجدد نیست. برای
                      پرداخت مجدد باید یک
                      تلاش پرداخت جدید
                      ایجاد شود.
                    </p>
                  </div>

                  <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-red-50 px-4 text-xs font-semibold text-red-500">
                    پرداخت ناموفق
                  </span>
                </div>

              /* REFUNDED */

              ) : latestPayment?.status ===
                "REFUNDED" ? (
                <div>
                  <p className="text-sm font-bold text-neutral-700">
                    پرداخت بازپرداخت شده
                  </p>

                  <p className="mt-1 text-xs leading-6 text-neutral-400">
                    مبلغ این پرداخت
                    بازپرداخت شده است.
                  </p>
                </div>

              /* NO PAYMENT */

              ) : (
                <div>
                  <p className="text-sm font-bold text-black">
                    پرداختی ثبت نشده است
                  </p>

                  <p className="mt-1 text-xs leading-6 text-neutral-400">
                    هنوز هیچ تلاش پرداختی
                    برای این سفارش ثبت
                    نشده است.
                  </p>
                </div>
              )}

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
                  (item) => {
                    const originalPrice =
                      Number(
                        item.productPrice
                      );

                    const offer =
                      Number(
                        item.productOffer
                      );

                    const quantity =
                      Number(
                        item.quantity
                      );

                    const discountedUnitPrice =
                      originalPrice *
                      (1 -
                        offer / 100);

                    const totalDiscount =
                      originalPrice *
                      (offer / 100) *
                      quantity;

                    const hasDiscount =
                      Number.isFinite(
                        offer
                      ) &&
                      offer > 0;

                    const variantColor =
                      item.variant?.color ??
                      null;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4"
                      >

                        {/* Product Image */}

                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                          {item.product
                            ?.images?.[0] ? (
                            <img
                              src={normalizeImageUrl(
                                item.product
                                  .images[0]
                              )}
                              alt={
                                item.product
                                  .title ||
                                item.productTitle
                              }
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package
                                size={18}
                                className="text-neutral-300"
                              />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-black">
                            {item.product
                              ?.title ||
                              item.productTitle}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">

                            {/* Color */}

                            {variantColor && (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-50 px-2 py-1 text-neutral-500">
                                <span
                                  className="h-3 w-3 shrink-0 rounded-full border border-black/10 shadow-sm"
                                  style={{
                                    backgroundColor:
                                      variantColor,
                                  }}
                                />

                                <span>
                                  رنگ:
                                </span>

                                <span className="font-semibold text-neutral-700">
                                  {
                                    variantColor
                                  }
                                </span>
                              </span>
                            )}

                            {/* Quantity */}

                            <span className="text-neutral-400">
                              تعداد:{" "}
                              {formatNumber(
                                quantity
                              )}
                            </span>

                            {/* Unit Price */}

                            <span className="text-neutral-400">
                              قیمت واحد:
                            </span>

                            {hasDiscount ? (
                              <>
                                <span className="text-neutral-400 line-through">
                                  {formatPrice(
                                    originalPrice
                                  )}{" "}
                                  تومان
                                </span>

                                <span className="rounded-lg bg-red-50 px-2 py-1 font-semibold text-red-500">
                                  {formatNumber(
                                    offer
                                  )}
                                  ٪ تخفیف
                                </span>
                              </>
                            ) : (
                              <span className="font-medium text-neutral-500">
                                {formatPrice(
                                  originalPrice
                                )}{" "}
                                تومان
                              </span>
                            )}
                          </div>

                          {/* Discount Details */}

                          {hasDiscount && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="text-xs text-neutral-400">
                                قیمت بعد از تخفیف:
                              </span>

                              <span className="text-xs font-bold text-black">
                                {formatPrice(
                                  discountedUnitPrice
                                )}{" "}
                                تومان
                              </span>

                              <span className="mx-1 h-1 w-1 rounded-full bg-neutral-300" />

                              <span className="text-xs text-neutral-400">
                                مبلغ تخفیف:
                              </span>

                              <span className="text-xs font-semibold text-red-500">
                                {formatPrice(
                                  totalDiscount
                                )}{" "}
                                تومان
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Final Item Price */}

                        <div className="shrink-0 text-left">
                          {hasDiscount && (
                            <p className="mb-1 text-xs text-neutral-400 line-through">
                              {formatPrice(
                                originalPrice *
                                  quantity
                              )}{" "}
                              تومان
                            </p>
                          )}

                          <p className="text-sm font-bold text-black">
                            {formatPrice(
                              item.totalPrice
                            )}{" "}
                            تومان
                          </p>

                          {hasDiscount && (
                            <p className="mt-1 text-[11px] font-medium text-red-500">
                              با تخفیف
                            </p>
                          )}
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              {/* Final Total */}

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

/* =========================================================
   Section Title
========================================================= */

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

/* =========================================================
   Info Box
========================================================= */

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

/* =========================================================
   Skeleton
========================================================= */

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