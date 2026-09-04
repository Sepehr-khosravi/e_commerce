"use client";

import { FormEvent, useEffect, useState } from "react";

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    _count?: {
        products: number;
    };
}

interface CategoryForm {
    name: string;
    slug: string;
    description: string;
}

const emptyForm: CategoryForm = {
    name: "",
    slug: "",
    description: "",
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState<CategoryForm>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);

    // --------------------------------------------------
    // Fetch categories
    // --------------------------------------------------

    async function loadCategories() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/categories", {
                method: "GET",
                cache: "no-store",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "خطا در دریافت دسته بندی‌ها"
                );
            }

            setCategories(
                Array.isArray(data.categories)
                    ? data.categories
                    : []
            );
        } catch (error) {
            console.error("Load categories error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "خطا در دریافت دسته بندی‌ها"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    // --------------------------------------------------
    // Form helpers
    // --------------------------------------------------

    function handleChange(
        field: keyof CategoryForm,
        value: string
    ) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setError("");
        setSuccess("");
    }

    function resetForm() {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
    }

    // --------------------------------------------------
    // Create / Edit
    // --------------------------------------------------

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = form.name.trim();
        const slug = form.slug.trim();
        const description = form.description.trim();

        if (!name) {
            setError("نام دسته بندی را وارد کنید.");
            return;
        }

        if (!slug) {
            setError("Slug دسته بندی را وارد کنید.");
            return;
        }

        try {
            setSubmitting(true);

            const isEditing = editingId !== null;

            const url = isEditing
                ? `/api/admin/categories/${editingId}`
                : "/api/admin/categories";

            const response = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    name,
                    slug,
                    description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "خطا در ذخیره دسته بندی"
                );
            }

            if (isEditing) {
                setCategories((prev) =>
                    prev.map((category) =>
                        category.id === editingId
                            ? {
                                  ...category,
                                  ...data.category,
                              }
                            : category
                    )
                );

                setSuccess(
                    "دسته بندی با موفقیت ویرایش شد."
                );
            } else {
                setCategories((prev) => [
                    data.category,
                    ...prev,
                ]);

                setSuccess(
                    "دسته بندی با موفقیت ایجاد شد."
                );
            }

            resetForm();
        } catch (error) {
            console.error("Save category error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "خطا در ذخیره دسته بندی"
            );
        } finally {
            setSubmitting(false);
        }
    }

    // --------------------------------------------------
    // Edit
    // --------------------------------------------------

    function handleEdit(category: Category) {
        setEditingId(category.id);

        setForm({
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------

    async function handleDelete(id: number) {
        const category = categories.find(
            (item) => item.id === id
        );

        if (!category) {
            return;
        }

        const confirmed = window.confirm(
            `آیا مطمئن هستید که می‌خواهید دسته بندی «${category.name}» را حذف کنید؟`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");
            setSuccess("");

            const response = await fetch(
                `/api/admin/categories/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "خطا در حذف دسته بندی"
                );
            }

            setCategories((prev) =>
                prev.filter(
                    (category) =>
                        category.id !== id
                )
            );

            if (editingId === id) {
                resetForm();
            }

            setSuccess(
                "دسته بندی با موفقیت حذف شد."
            );
        } catch (error) {
            console.error(
                "Delete category error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "خطا در حذف دسته بندی"
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main
            dir="rtl"
            className="min-h-screen bg-white text-black"
        >
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ==========================================
                    Header
                ========================================== */}

                <header className="mb-10">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-black" />

                                <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                                    Admin / Categories
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                مدیریت دسته‌بندی‌ها
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                                دسته‌بندی‌های فروشگاه را ایجاد،
                                ویرایش و مدیریت کنید.
                            </p>
                        </div>

                        {!loading && (
                            <div className="flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-5">
                                <span className="text-2xl font-bold">
                                    {categories.length}
                                </span>

                                <span className="text-xs text-neutral-500">
                                    دسته‌بندی
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                {/* ==========================================
                    Messages
                ========================================== */}

                {(error || success) && (
                    <div className="mb-6">
                        {error && (
                            <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-800">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                                    !
                                </div>

                                <span className="pt-0.5">
                                    {error}
                                </span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-800">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                                    ✓
                                </div>

                                <span className="pt-0.5">
                                    {success}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* ==========================================
                    Form
                ========================================== */}

                <section
                    className={`mb-8 overflow-hidden rounded-3xl border bg-white transition-all ${
                        editingId !== null
                            ? "border-black shadow-[0_15px_50px_rgba(0,0,0,0.08)]"
                            : "border-neutral-200 shadow-[0_8px_35px_rgba(0,0,0,0.04)]"
                    }`}
                >
                    {/* Form top bar */}

                    <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 sm:px-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-lg text-white">
                                {editingId !== null ? "✎" : "+"}
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    {editingId !== null
                                        ? "ویرایش دسته‌بندی"
                                        : "دسته‌بندی جدید"}
                                </h2>

                                <p className="mt-1 text-xs text-neutral-400">
                                    {editingId !== null
                                        ? "تغییرات دسته‌بندی را ذخیره کنید."
                                        : "یک دسته‌بندی جدید به فروشگاه اضافه کنید."}
                                </p>
                            </div>
                        </div>

                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={submitting}
                                className="rounded-xl px-3 py-2 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-black disabled:opacity-50"
                            >
                                لغو
                            </button>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-6 sm:p-8"
                    >
                        <div className="grid gap-5 lg:grid-cols-2">

                            {/* Name */}

                            <div>
                                <label
                                    htmlFor="category-name"
                                    className="mb-2.5 block text-xs font-semibold text-neutral-700"
                                >
                                    نام دسته‌بندی
                                </label>

                                <input
                                    id="category-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        handleChange(
                                            "name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="مثلاً لپ تاپ"
                                    disabled={submitting}
                                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            {/* Slug */}

                            <div>
                                <label
                                    htmlFor="category-slug"
                                    className="mb-2.5 block text-xs font-semibold text-neutral-700"
                                >
                                    Slug
                                </label>

                                <input
                                    id="category-slug"
                                    type="text"
                                    value={form.slug}
                                    onChange={(event) =>
                                        handleChange(
                                            "slug",
                                            event.target.value
                                        )
                                    }
                                    placeholder="laptops"
                                    disabled={submitting}
                                    dir="ltr"
                                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-left text-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            {/* Description */}

                            <div className="lg:col-span-2">
                                <label
                                    htmlFor="category-description"
                                    className="mb-2.5 block text-xs font-semibold text-neutral-700"
                                >
                                    توضیحات
                                    <span className="mr-1 font-normal text-neutral-400">
                                        اختیاری
                                    </span>
                                </label>

                                <textarea
                                    id="category-description"
                                    value={form.description}
                                    onChange={(event) =>
                                        handleChange(
                                            "description",
                                            event.target.value
                                        )
                                    }
                                    placeholder="توضیح کوتاهی درباره این دسته‌بندی..."
                                    disabled={submitting}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Form actions */}

                        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-end">
                            {editingId !== null && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={submitting}
                                    className="h-12 rounded-xl border border-neutral-200 px-6 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
                                >
                                    لغو
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="h-12 rounded-xl bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                        {editingId !== null
                                            ? "در حال ذخیره..."
                                            : "در حال ایجاد..."}
                                    </span>
                                ) : editingId !== null ? (
                                    "ذخیره تغییرات"
                                ) : (
                                    "ایجاد دسته‌بندی"
                                )}
                            </button>
                        </div>
                    </form>
                </section>

                {/* ==========================================
                    Categories list
                ========================================== */}

                <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_8px_35px_rgba(0,0,0,0.04)]">

                    {/* List header */}

                    <div className="flex flex-col gap-3 border-b border-neutral-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <div>
                            <h2 className="font-semibold">
                                دسته‌بندی‌ها
                            </h2>

                            <p className="mt-1 text-xs text-neutral-400">
                                لیست تمام دسته‌بندی‌های فروشگاه
                            </p>
                        </div>

                        {!loading && categories.length > 0 && (
                            <span className="w-fit rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white">
                                {categories.length} مورد
                            </span>
                        )}
                    </div>

                    {/* ======================================
                        Skeleton
                    ====================================== */}

                    {loading ? (
                        <div className="divide-y divide-neutral-100">
                            {Array.from({
                                length: 6,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="relative overflow-hidden px-6 py-6 sm:px-8"
                                >
                                    {/* shimmer */}

                                    <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />

                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                        <div className="flex min-w-0 flex-1 items-center gap-4">

                                            <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-neutral-200" />

                                            <div className="min-w-0 flex-1">
                                                <div className="h-4 w-40 animate-pulse rounded-md bg-neutral-200" />

                                                <div className="mt-3 h-3 w-28 animate-pulse rounded-md bg-neutral-100" />

                                                <div className="mt-2 h-3 w-64 max-w-full animate-pulse rounded-md bg-neutral-100" />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="h-10 w-20 animate-pulse rounded-xl bg-neutral-100" />

                                            <div className="h-10 w-20 animate-pulse rounded-xl bg-neutral-100" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : categories.length === 0 ? (

                        /* ==================================
                           Empty state
                        ================================== */

                        <div className="px-6 py-20 text-center sm:px-8">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-3xl text-white">
                                +
                            </div>

                            <h3 className="text-lg font-semibold">
                                هنوز دسته‌بندی‌ای وجود ندارد
                            </h3>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-400">
                                برای شروع، اولین دسته‌بندی
                                فروشگاه خود را از فرم بالا ایجاد
                                کنید.
                            </p>
                        </div>

                    ) : (

                        /* ==================================
                           Categories
                        ================================== */

                        <div className="divide-y divide-neutral-100">

                            {categories.map(
                                (category, index) => (
                                    <div
                                        key={category.id}
                                        className="group px-6 py-5 transition-colors hover:bg-neutral-50 sm:px-8"
                                    >
                                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                            {/* Info */}

                                            <div className="flex min-w-0 items-center gap-4">

                                                {/* Number */}

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-400 transition group-hover:border-black group-hover:bg-black group-hover:text-white">
                                                    {String(
                                                        index + 1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="truncate text-sm font-semibold text-black">
                                                            {
                                                                category.name
                                                            }
                                                        </h3>

                                                        {category._count && (
                                                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                                                                {
                                                                    category
                                                                        ._count
                                                                        .products
                                                                }{" "}
                                                                محصول
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">

                                                        <span
                                                            dir="ltr"
                                                            className="font-mono"
                                                        >
                                                            /
                                                            {
                                                                category.slug
                                                            }
                                                        </span>

                                                        {category.description && (
                                                            <>
                                                                <span className="text-neutral-300">
                                                                    /
                                                                </span>

                                                                <span className="max-w-md truncate">
                                                                    {
                                                                        category.description
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}

                                            <div className="flex shrink-0 items-center gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            category
                                                        )
                                                    }
                                                    disabled={
                                                        submitting ||
                                                        deletingId !==
                                                            null
                                                    }
                                                    className="h-10 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    ویرایش
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id
                                                        )
                                                    }
                                                    disabled={
                                                        submitting ||
                                                        deletingId !==
                                                            null
                                                    }
                                                    className="flex h-10 items-center justify-center rounded-xl border border-neutral-200 px-4 text-xs font-medium text-neutral-500 transition hover:border-black hover:bg-neutral-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    {deletingId ===
                                                    category.id ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

                                                            در حال حذف
                                                        </span>
                                                    ) : (
                                                        "حذف"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* ==========================================
                Skeleton shimmer keyframes
            ========================================== */}

            <style jsx global>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </main>
    );
}