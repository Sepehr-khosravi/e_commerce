"use client";

import { FormEvent, useState } from "react";

const contactMethods = [
    {
        title: "پشتیبانی",
        value: "support@example.com",
        description:
            "برای سؤالات مربوط به سفارش، محصول و خرید",
    },
    {
        title: "تماس تلفنی",
        value: "021 1234 5678",
        description:
            "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر",
    },
    {
        title: "آدرس",
        value: "تهران، خیابان مثال",
        description:
            "دفتر مرکزی و واحد پشتیبانی",
    },
];

const faqs = [
    {
        question:
            "چطور می‌توانم وضعیت سفارش خود را ببینم؟",
        answer:
            "بعد از ورود به حساب کاربری، از بخش سفارش‌های من می‌توانید وضعیت سفارش خود را مشاهده کنید.",
    },
    {
        question:
            "چطور با پشتیبانی تماس بگیرم؟",
        answer:
            "می‌توانید از طریق فرم تماس، ایمیل یا شماره تلفن درج‌شده در همین صفحه با ما در ارتباط باشید.",
    },
    {
        question:
            "آیا امکان پیگیری سفارش وجود دارد؟",
        answer:
            "بله. سفارش‌های ثبت‌شده دارای وضعیت هستند و اطلاعات آن‌ها از حساب کاربری قابل مشاهده است.",
    },
    {
        question:
            "اگر محصولی که می‌خواهم موجود نباشد چه کنم؟",
        answer:
            "می‌توانید با پشتیبانی تماس بگیرید تا درباره موجودی و زمان تأمین محصول راهنمایی‌تان کنیم.",
    },
];

export default function ContactPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(
        null
    );

    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSending(true);
        setSent(false);

        // Connect this to your API later.
        setTimeout(() => {
            setSending(false);
            setSent(true);

            setForm({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
        }, 900);
    }

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

                    <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">

                        <div>
                            <div className="mb-6 flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-black" />

                                <span className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
                                    Contact us
                                </span>
                            </div>

                            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
                                با ما
                                <br />
                                <span className="text-neutral-400">
                                    در ارتباط باش.
                                </span>
                            </h1>
                        </div>

                        <div className="flex items-end">
                            <p className="max-w-lg text-base leading-8 text-neutral-500">
                                سؤال، پیشنهاد یا مشکلی داری؟
                                پیام خودت را برای ما ارسال کن.
                                تیم پشتیبانی آماده پاسخگویی به
                                شماست.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* ==========================================
                Contact methods
            ========================================== */}

            <section>
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">

                    <div className="grid border-y border-neutral-200 md:grid-cols-3">

                        {contactMethods.map(
                            (method, index) => (
                                <div
                                    key={method.title}
                                    className={`px-6 py-8 sm:px-8 ${
                                        index !== 0
                                            ? "border-t border-neutral-200 md:border-r md:border-t-0"
                                            : ""
                                    }`}
                                >
                                    <span className="text-xs font-mono text-neutral-400">
                                        0{index + 1}
                                    </span>

                                    <h2 className="mt-8 text-lg font-semibold">
                                        {method.title}
                                    </h2>

                                    <p className="mt-3 text-sm font-medium">
                                        {method.value}
                                    </p>

                                    <p className="mt-2 text-xs leading-6 text-neutral-400">
                                        {
                                            method.description
                                        }
                                    </p>
                                </div>
                            )
                        )}

                    </div>
                </div>
            </section>

            {/* ==========================================
                Contact form
            ========================================== */}

            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">

                    <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">

                        {/* Text */}

                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                                Send a message
                            </span>

                            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                                پیام خودت را
                                <br />
                                ارسال کن.
                            </h2>

                            <p className="mt-5 max-w-md text-sm leading-7 text-neutral-500">
                                فرم روبه‌رو را تکمیل کنید. پیام
                                شما برای تیم پشتیبانی ارسال می‌شود
                                و در اولین فرصت پاسخ خواهیم داد.
                            </p>

                            <div className="mt-10 border-t border-neutral-200 pt-6">
                                <p className="text-xs text-neutral-400">
                                    زمان معمول پاسخگویی
                                </p>

                                <p className="mt-2 text-sm font-semibold">
                                    کمتر از یک روز کاری
                                </p>
                            </div>
                        </div>

                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] sm:p-8"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">

                                {/* Name */}

                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2.5 block text-xs font-semibold"
                                    >
                                        نام و نام خانوادگی
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(event) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    name: event
                                                        .target
                                                        .value,
                                                }
                                            )
                                        }
                                        placeholder="نام شما"
                                        className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                                    />
                                </div>

                                {/* Email */}

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2.5 block text-xs font-semibold"
                                    >
                                        ایمیل
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(event) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    email: event
                                                        .target
                                                        .value,
                                                }
                                            )
                                        }
                                        placeholder="you@example.com"
                                        dir="ltr"
                                        className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-left text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                                    />
                                </div>

                                {/* Subject */}

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="subject"
                                        className="mb-2.5 block text-xs font-semibold"
                                    >
                                        موضوع
                                    </label>

                                    <input
                                        id="subject"
                                        type="text"
                                        required
                                        value={form.subject}
                                        onChange={(event) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    subject: event
                                                        .target
                                                        .value,
                                                }
                                            )
                                        }
                                        placeholder="موضوع پیام"
                                        className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                                    />
                                </div>

                                {/* Message */}

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="message"
                                        className="mb-2.5 block text-xs font-semibold"
                                    >
                                        پیام
                                    </label>

                                    <textarea
                                        id="message"
                                        required
                                        rows={7}
                                        value={form.message}
                                        onChange={(event) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    message: event
                                                        .target
                                                        .value,
                                                }
                                            )
                                        }
                                        placeholder="پیام خود را اینجا بنویسید..."
                                        className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                                    />
                                </div>
                            </div>

                            {/* Success */}

                            {sent && (
                                <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
                                    پیام شما با موفقیت ثبت شد.
                                </div>
                            )}

                            {/* Submit */}

                            <button
                                type="submit"
                                disabled={sending}
                                className="mt-6 h-12 w-full rounded-xl bg-black text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {sending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        در حال ارسال...
                                    </span>
                                ) : (
                                    "ارسال پیام"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ==========================================
                FAQ
            ========================================== */}

            <section>
                <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28">

                    <div className="mb-12 text-center">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            FAQ
                        </span>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            سؤالات متداول
                        </h2>

                        <p className="mt-4 text-sm text-neutral-500">
                            پاسخ بعضی از سؤالات رایج کاربران
                        </p>
                    </div>

                    <div className="border-t border-neutral-200">

                        {faqs.map((faq, index) => {
                            const isOpen =
                                openFaq === index;

                            return (
                                <div
                                    key={faq.question}
                                    className="border-b border-neutral-200"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenFaq(
                                                isOpen
                                                    ? null
                                                    : index
                                            )
                                        }
                                        className="flex w-full items-center justify-between gap-5 py-6 text-right"
                                    >
                                        <span className="text-sm font-semibold">
                                            {faq.question}
                                        </span>

                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-lg transition-transform ${
                                                isOpen
                                                    ? "rotate-45"
                                                    : ""
                                            }`}
                                        >
                                            +
                                        </span>
                                    </button>

                                    <div
                                        className={`grid transition-all duration-300 ${
                                            isOpen
                                                ? "grid-rows-[1fr] pb-6 opacity-100"
                                                : "grid-rows-[0fr] opacity-0"
                                        }`}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="max-w-3xl text-sm leading-7 text-neutral-500">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </div>
            </section>

            {/* ==========================================
                Final CTA
            ========================================== */}

            <section className="border-t border-neutral-200">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">

                    <div className="flex flex-col gap-6 rounded-3xl bg-black px-6 py-10 text-white sm:px-10 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <h2 className="text-2xl font-bold">
                                هنوز سؤالی داری؟
                            </h2>

                            <p className="mt-2 text-sm text-neutral-400">
                                ما اینجاییم تا کمکت کنیم.
                            </p>
                        </div>

                        <a
                            href="mailto:support@example.com"
                            className="inline-flex h-11 w-fit items-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-neutral-200"
                        >
                            ارسال ایمیل
                            <span className="mr-3">
                                ←
                            </span>
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}