"use client";

import Link from "next/link";  
import { useEffect, useState } from "react";

const features = [
    {
        number: "01",
        title: "انتخاب هوشمند",
        description:
            "کمکت می‌کنیم محصولی انتخاب کنی که واقعاً با نیاز و سبک استفاده‌ات هماهنگ باشد.",
    },
    {
        number: "02",
        title: "تنوع محصولات",
        description:
            "از لپ‌تاپ و موبایل گرفته تا تجهیزات گیمینگ و لوازم جانبی، همه‌چیز را در یکجا پیدا کن.",
    },
    {
        number: "03",
        title: "خرید ساده",
        description:
            "فرآیند جستجو، انتخاب و خرید را تا جای ممکن ساده و سریع طراحی کرده‌ایم.",
    },
    {
        number: "04",
        title: "پشتیبانی واقعی",
        description:
            "اگر قبل یا بعد از خرید سؤالی داشته باشی، تیم پشتیبانی آماده کمک به توست.",
    },
];

// const categories = [
//     "لپ‌تاپ",
//     "موبایل",
//     "تجهیزات گیمینگ",
//     "کیبورد",
//     "ماوس",
//     "لوازم جانبی",
// ];

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
}

export default function AboutPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        async function loadCategories() {
            try {
                setCategoriesLoading(true);
    
                const response = await fetch("/api/categories", {
                    method: "GET",
                    cache: "no-store",
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(
                        data?.error || "Failed to load categories"
                    );
                }
    
                setCategories(
                    Array.isArray(data.categories)
                        ? data.categories
                        : []
                );
            } catch (error) {
                console.error(
                    "Load categories error:",
                    error
                );
    
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        }
    
        loadCategories();
    }, []);

    return (
        <main
            dir="rtl"
            className="min-h-screen bg-white text-black"
        >
            {/* ==========================================
                Hero
            ========================================== */}

            <section className="border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">

                    <div className="grid items-end gap-12 lg:grid-cols-[1.4fr_0.6fr]">

                        <div>
                            <div className="mb-6 flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-black" />

                                <span className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
                                    About us
                                </span>
                            </div>

                            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
                                تکنولوژی،
                                <br />
                                <span className="text-neutral-400">
                                    ساده‌تر از همیشه.
                                </span>
                            </h1>
                        </div>

                        <div className="lg:pb-2">
                            <p className="text-base leading-8 text-neutral-500">
                                ما یک فروشگاه آنلاین برای علاقه‌مندان
                                به تکنولوژی هستیم؛ جایی که می‌توانی
                                محصولات دیجیتال مورد نیازت را پیدا،
                                مقایسه و با اطمینان خریداری کنی.
                            </p>

                            <Link
                                href="/products"
                                className="mt-7 inline-flex h-12 items-center rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
                            >
                                مشاهده محصولات
                                <span className="mr-3">
                                    ←
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                Intro
            ========================================== */}

            <section className="border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">

                    <div className="grid gap-12 lg:grid-cols-2">

                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                                Our story
                            </span>

                            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                                چرا این فروشگاه؟
                            </h2>
                        </div>

                        <div className="space-y-6 text-sm leading-8 text-neutral-500">
                            <p>
                                انتخاب یک محصول دیجیتال خوب همیشه
                                ساده نیست. مدل‌های مختلف، مشخصات
                                فنی، قیمت‌ها و کاربردهای متفاوت باعث
                                می‌شوند انتخاب محصول مناسب زمان‌بر
                                باشد.
                            </p>

                            <p>
                                هدف ما این است که این تجربه را ساده‌تر
                                کنیم. محصولات را در دسته‌بندی‌های
                                مشخص در اختیار شما قرار می‌دهیم تا
                                بتوانید راحت‌تر محصول مورد نظر خود را
                                پیدا کنید.
                            </p>

                            <p>
                                از یک لپ‌تاپ برای کار و دانشگاه گرفته
                                تا یک موبایل جدید یا تجهیزات گیمینگ،
                                تلاش می‌کنیم تجربه خرید آنلاین سریع،
                                شفاف و قابل اعتماد باشد.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                Stats
            ========================================== */}

            <section className="bg-black text-white">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">

                    <div className="grid grid-cols-2 divide-x divide-neutral-800 divide-x-reverse lg:grid-cols-4">

                        <div className="px-5 py-5 text-center sm:px-8">
                            <div className="text-4xl font-bold sm:text-5xl">
                                100+
                            </div>

                            <p className="mt-3 text-xs text-neutral-400">
                                محصول متنوع
                            </p>
                        </div>

                        <div className="px-5 py-5 text-center sm:px-8">
                            <div className="text-4xl font-bold sm:text-5xl">
                                20+
                            </div>

                            <p className="mt-3 text-xs text-neutral-400">
                                دسته‌بندی
                            </p>
                        </div>

                        <div className="px-5 py-5 text-center sm:px-8">
                            <div className="text-4xl font-bold sm:text-5xl">
                                24/7
                            </div>

                            <p className="mt-3 text-xs text-neutral-400">
                                دسترسی به فروشگاه
                            </p>
                        </div>

                        <div className="px-5 py-5 text-center sm:px-8">
                            <div className="text-4xl font-bold sm:text-5xl">
                                100%
                            </div>

                            <p className="mt-3 text-xs text-neutral-400">
                                تمرکز روی تجربه کاربر
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* ==========================================
                Features
            ========================================== */}

            <section>
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">

                    <div className="mb-14 max-w-2xl">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            Why us
                        </span>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            چیزی فراتر از یک فروشگاه
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-neutral-500">
                            ما فقط محصولات را کنار هم قرار نداده‌ایم؛
                            هدفمان ساختن تجربه‌ای بهتر برای خرید
                            محصولات تکنولوژی است.
                        </p>
                    </div>

                    <div className="grid border-t border-neutral-200 sm:grid-cols-2 lg:grid-cols-4">

                        {features.map((feature) => (
                            <div
                                key={feature.number}
                                className="group border-b border-neutral-200 px-6 py-8 transition hover:bg-neutral-50 sm:border-l sm:px-8 lg:border-l-0 lg:border-l lg:border-neutral-200 lg:first:border-l"
                            >
                                <span className="text-xs font-mono text-neutral-400">
                                    {feature.number}
                                </span>

                                <h3 className="mt-10 text-lg font-semibold">
                                    {feature.title}
                                </h3>

                                <p className="mt-4 text-sm leading-7 text-neutral-500">
                                    {feature.description}
                                </p>
                            </div>
                        ))}

                    </div>
                </div>
            </section>

            {/* ==========================================
                Categories
            ========================================== */}
            
            <section className="border-t border-neutral-200 bg-neutral-50">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
            
                    <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                                Categories
                            </span>
            
                            <h2 className="mt-4 text-3xl font-bold tracking-tight">
                                برای هر سبک استفاده
                            </h2>
                        </div>
            
                        <Link
                            href="/products"
                            className="text-sm font-semibold underline underline-offset-4"
                        >
                            مشاهده همه دسته‌بندی‌ها
                        </Link>
                    </div>
            
                    {/* Categories */}
            
                    {categoriesLoading ? (
                        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            {Array.from({ length: 6 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="relative h-36 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                                    >
                                        <div className="absolute inset-0 -translate-x-full animate-[categoryShimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
            
                                        <div className="p-5">
                                            <div className="h-3 w-6 animate-pulse rounded bg-neutral-200" />
            
                                            <div className="mt-10 h-4 w-24 animate-pulse rounded bg-neutral-200" />
            
                                            <div className="mt-4 h-3 w-4 animate-pulse rounded bg-neutral-100" />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center">
                            <p className="text-sm text-neutral-400">
                                در حال حاضر دسته‌بندی‌ای وجود ندارد.
                            </p>
                        </div>
                    ) : (
                            <div className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">                            {categories.map((category, index) => (
                                <Link
                                    key={category.id}
                                    href={`/products/${category.slug}`}
                                    className="group rounded-2xl border border-neutral-200 bg-white p-5 transition duration-300 hover:border-black hover:bg-black hover:text-white"
                                >
                                    <span className="text-xs font-mono text-neutral-400 transition group-hover:text-neutral-500">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
            
                                    <div className="mt-10 truncate text-sm font-semibold">
                                        {category.name}
                                    </div>
            
                                    <div className="mt-4 text-lg transition-transform duration-300 group-hover:-translate-x-1">
                                        ←
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ==========================================
                CTA
            ========================================== */}

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">

                    <div className="rounded-[2rem] bg-black px-6 py-16 text-center text-white sm:px-10 lg:py-24">

                        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                            Start shopping
                        </span>

                        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
                            محصول مناسب سبک زندگی
                            <br />
                            <span className="text-neutral-500">
                                خودت را پیدا کن.
                            </span>
                        </h2>

                        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-400">
                            محصولات مختلف را بررسی کن و چیزی را
                            انتخاب کن که واقعاً به کارت می‌آید.
                        </p>

                        <Link
                            href="/products"
                            className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-7 text-sm font-semibold text-black transition hover:bg-neutral-200"
                        >
                            شروع خرید
                            <span className="mr-3">
                                ←
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}