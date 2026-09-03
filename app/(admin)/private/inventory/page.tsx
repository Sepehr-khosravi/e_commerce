"use client";

import { useEffect, useState, useCallback } from "react";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  count: number;
  category?: Category | null;
  updatedAt?: string;
}

interface InventoryResponse {
  lowStock: Product[];
  outOfStock: Product[];
}

export default function InventoryPage() {
  const [data, setData] = useState<InventoryResponse>({
    lowStock: [],
    outOfStock: [],
  });

  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCount, setEditingCount] = useState("");

  // تابع دریافت موجودی با کش کردن
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/inventory?threshold=${threshold}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در دریافت موجودی");
      }

      setData(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطا در دریافت موجودی");
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // تابع بروزرسانی موجودی با اعتبارسنجی کامل
  const updateStock = useCallback(async (productId: number, count: number) => {
    // اعتبارسنجی ورودی
    if (!Number.isInteger(count) || count < 0 || isNaN(count)) {
      alert("لطفاً یک عدد مثبت معتبر وارد کنید");
      return;
    }

    try {
      setUpdatingId(productId);

      const response = await fetch(`/api/admin/inventory/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ count }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در بروزرسانی موجودی");
      }

      setEditingId(null);
      setEditingCount("");
      await fetchInventory();
    } catch (error) {
      alert(error instanceof Error ? error.message : "خطا در بروزرسانی موجودی");
    } finally {
      setUpdatingId(null);
    }
  }, [fetchInventory]);

  const startEditing = useCallback((product: Product) => {
    setEditingId(product.id);
    setEditingCount(String(product.count));
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditingCount("");
  }, []);

  // مدیریت تغییر آستانه
  const handleThresholdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setThreshold(0);
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setThreshold(Math.max(0, Math.floor(num)));
    }
  }, []);

  // حذف محصولات تکراری
  const allProducts = Array.from(
    new Map([...data.lowStock, ...data.outOfStock].map(product => [product.id, product])).values()
  );

  const totalLowStock = data.lowStock.length;
  const totalOutOfStock = data.outOfStock.length;

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6 rtl">
      <div className="mx-auto max-w-7xl">
        {/* هدر */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">مدیریت موجودی</h1>
            <p className="mt-1 text-sm text-gray-500">
              مدیریت موجودی کالاها و نظارت بر موجودی کم
            </p>
          </div>

          <button
            onClick={fetchInventory}
            disabled={loading}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال بروزرسانی..." : "بروزرسانی"}
          </button>
        </div>

        {/* آمار */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">موجودی کم</p>
            <p className="mt-2 text-3xl font-bold text-black">{totalLowStock}</p>
            <p className="mt-1 text-xs text-gray-400">
              محصولات با {threshold} واحد یا کمتر
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">ناموجود</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{totalOutOfStock}</p>
            <p className="mt-1 text-xs text-gray-400">محصولات بدون موجودی</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">آستانه هشدار</p>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                min={0}
                step={1}
                value={threshold}
                onChange={handleThresholdChange}
                className="w-24 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <span className="text-xs text-gray-400">واحد</span>
            </div>
          </div>
        </div>

        {/* خطا */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* بارگذاری و وضعیت خالی */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black"></div>
              <span className="mr-3">در حال بارگذاری موجودی...</span>
            </div>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="font-semibold text-black">وضعیت موجودی خوب است</h2>
            <p className="mt-1 text-sm text-gray-500">
              هیچ محصولی در حال حاضر زیر آستانه تعیین شده نیست
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* جدول دسکتاپ */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-right">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      محصول
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      دسته‌بندی
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      موجودی
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      وضعیت
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.map((product) => {
                    const isOutOfStock = product.count <= 0;
                    const isEditing = editingId === product.id;
                    const isUpdating = updatingId === product.id;

                    return (
                      <tr key={product.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium text-black">{product.title}</p>
                            <p className="mt-1 text-xs text-gray-400">شناسه #{product.id}</p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {product.category?.name ?? "بدون دسته‌بندی"}
                        </td>

                        <td className="px-6 py-5">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              step={1}
                              autoFocus
                              value={editingCount}
                              onChange={(e) => setEditingCount(e.target.value)}
                              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateStock(product.id, Number(editingCount));
                                }
                                if (e.key === "Escape") {
                                  cancelEditing();
                                }
                              }}
                            />
                          ) : (
                            <span className="font-semibold text-black">{product.count}</span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {isOutOfStock ? (
                            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                              ناموجود
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                              موجودی کم
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-start gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => updateStock(product.id, Number(editingCount))}
                                  disabled={isUpdating}
                                  className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                  {isUpdating ? "در حال ذخیره..." : "ذخیره"}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={isUpdating}
                                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                >
                                  انصراف
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditing(product)}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-black hover:bg-gray-50"
                              >
                                ویرایش موجودی
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* کارت‌های موبایل */}
            <div className="divide-y divide-gray-100 md:hidden">
              {allProducts.map((product) => {
                const isOutOfStock = product.count <= 0;
                const isEditing = editingId === product.id;
                const isUpdating = updatingId === product.id;

                return (
                  <div key={product.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-black">{product.title}</h3>
                        <p className="mt-1 text-xs text-gray-400">شناسه #{product.id}</p>
                        <p className="mt-2 text-sm text-gray-500">
                          {product.category?.name ?? "بدون دسته‌بندی"}
                        </p>
                      </div>

                      {isOutOfStock ? (
                        <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                          ناموجود
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                          کم
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">موجودی</p>
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            step={1}
                            autoFocus
                            value={editingCount}
                            onChange={(e) => setEditingCount(e.target.value)}
                            className="mt-1 w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateStock(product.id, Number(editingCount));
                              }
                              if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                          />
                        ) : (
                          <p className="mt-1 text-xl font-bold text-black">{product.count}</p>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStock(product.id, Number(editingCount))}
                            disabled={isUpdating}
                            className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                          >
                            {isUpdating ? "در حال ذخیره..." : "ذخیره"}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isUpdating}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium"
                          >
                            انصراف
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(product)}
                          className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-black"
                        >
                          ویرایش
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}