"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ImagePlus,
  Package,
  Save,
  Trash2,
  X,
  GripVertical,
} from "lucide-react";

type Product = {
  id: number;
  title: string;
  slug: string;
  price: number | string;
  offer: number | string | null;
  images: string[];
  description: string;
  count: number;
  purchaseCount: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: number;
  name: string;
};

type ImageItem = {
  id: string;
  url: string;
  file?: File;
  preview?: string;
  isNew?: boolean;
};

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Number(value)
  );
}

function formatInputPrice(value: string) {
  const numbers = value.replace(/\D/g, "");

  if (!numbers) {
    return "";
  }

  return new Intl.NumberFormat("en-US").format(
    Number(numbers)
  );
}

function getNumericPrice(value: string) {
  return Number(value.replace(/,/g, ""));
}

function getFinalPrice(
  price: number,
  offer: number | null
) {
  if (
    offer === null ||
    offer <= 0 ||
    offer >= 100
  ) {
    return price;
  }

  return Math.round(
    price - price * (offer / 100)
  );
}

function createImageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [productId, setProductId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [offer, setOffer] =
    useState("");

  const [count, setCount] =
    useState("0");

  const [categoryId, setCategoryId] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [isFeatured, setIsFeatured] =
    useState(false);

  const [isActive, setIsActive] =
    useState(true);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [images, setImages] =
    useState<ImageItem[]>([]);

  /*
   * --------------------------------------------------
   * Load Product
   * --------------------------------------------------
   */

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        if (!/^\d+$/.test(id)) {
          throw new Error(
            "شناسه محصول نامعتبر است."
          );
        }

        const numericId = Number(id);

        setProductId(numericId);

        const response = await fetch(
          `/api/admin/products/${numericId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const text =
          await response.text();

        let data: {
          product?: Product;
          error?: string;
        } | null = null;

        try {
          data = text
            ? JSON.parse(text)
            : null;
        } catch {
          throw new Error(
            "پاسخ سرور معتبر نیست."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "دریافت محصول ناموفق بود."
          );
        }

        if (!data?.product) {
          throw new Error(
            "محصول پیدا نشد."
          );
        }

        const product = data.product;

        setTitle(product.title);
        setSlug(product.slug);

        setPrice(
          formatInputPrice(
            String(product.price)
          )
        );

        /*
         * offer در دیتابیس درصد تخفیف است.
         */
        setOffer(
          product.offer !== null
            ? String(product.offer)
            : ""
        );

        setCount(
          String(product.count)
        );

        setCategoryId(
          String(product.categoryId)
        );

        setDescription(
          product.description ?? ""
        );

        setIsFeatured(
          product.isFeatured
        );

        setIsActive(
          product.isActive
        );

        setImages(
          (product.images ?? []).map(
            (url) => ({
              id: createImageId(),
              url,
              isNew: false,
            })
          )
        );
      } catch (error) {
        console.error(
          "Edit product error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "خطایی رخ داده است."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params]);

  /*
   * --------------------------------------------------
   * Load Categories
   * --------------------------------------------------
   */

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const response = await fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "دریافت دسته‌بندی‌ها ناموفق بود."
          );
        }

        setCategories(
          data.categories ?? []
        );
      } catch (error) {
        console.error(
          "Categories error:",
          error
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  /*
   * --------------------------------------------------
   * Images
   * --------------------------------------------------
   */

  function handleImagesChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (!files.length) {
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(
          `فایل ${file.name} تصویر نیست.`
        );
        continue;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          `حجم ${file.name} بیشتر از ۵MB است.`
        );
        continue;
      }

      validFiles.push(file);
    }

    const newImages =
      validFiles.map((file) => ({
        id: createImageId(),
        url: "",
        file,
        preview:
          URL.createObjectURL(file),
        isNew: true,
      }));

    setImages((current) => [
      ...current,
      ...newImages,
    ]);

    event.target.value = "";
  }

  function removeImage(
    imageId: string
  ) {
    setImages((current) => {
      const image = current.find(
        (item) => item.id === imageId
      );

      if (image?.preview) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return current.filter(
        (item) => item.id !== imageId
      );
    });
  }

  /*
   * Move image left/right
   */
  function moveImage(
    index: number,
    direction: "left" | "right"
  ) {
    setImages((current) => {
      const newImages = [...current];

      const targetIndex =
        direction === "left"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= newImages.length
      ) {
        return current;
      }

      const temp =
        newImages[index];

      newImages[index] =
        newImages[targetIndex];

      newImages[targetIndex] =
        temp;

      return newImages;
    });
  }

  /*
   * Drag & Drop
   */

  function handleDragStart(
    event: React.DragEvent,
    index: number
  ) {
    event.dataTransfer.setData(
      "image-index",
      String(index)
    );
  }

  function handleDrop(
    event: React.DragEvent,
    targetIndex: number
  ) {
    event.preventDefault();

    const sourceIndex = Number(
      event.dataTransfer.getData(
        "image-index"
      )
    );

    if (
      Number.isNaN(sourceIndex) ||
      sourceIndex === targetIndex
    ) {
      return;
    }

    setImages((current) => {
      const newImages = [...current];

      const [
        movedImage,
      ] = newImages.splice(
        sourceIndex,
        1
      );

      newImages.splice(
        targetIndex,
        0,
        movedImage
      );

      return newImages;
    });
  }

  /*
   * --------------------------------------------------
   * Upload New Images
   * --------------------------------------------------
   */

  async function uploadNewImages(): Promise<
    Map<string, string>
  > {
    const newImages =
      images.filter(
        (image) =>
          image.isNew &&
          image.file
      );

    if (newImages.length === 0) {
      return new Map();
    }

    const formData =
      new FormData();

    for (const image of newImages) {
      if (image.file) {
        formData.append(
          "files",
          image.file
        );
      }
    }

    const response = await fetch(
      "/api/admin/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const text =
      await response.text();

    let data: {
      success?: boolean;
      urls?: string[];
      error?: string;
    } | null = null;

    try {
      data = text
        ? JSON.parse(text)
        : null;
    } catch {
      throw new Error(
        "پاسخ سرور آپلود معتبر نیست."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "آپلود تصاویر ناموفق بود."
      );
    }

    if (
      !data?.success ||
      !Array.isArray(data.urls) ||
      data.urls.length !==
        newImages.length
    ) {
      throw new Error(
        "تصاویر به درستی آپلود نشدند."
      );
    }

    /*
     * چون API آپلود به همان ترتیبی که فایل‌ها
     * ارسال شده‌اند URL می‌دهد، اینجا آنها را
     * به image مربوط می‌کنیم.
     */
    const result = new Map<
      string,
      string
    >();

    newImages.forEach(
      (image, index) => {
        const url =
          data.urls?.[index];

        if (url) {
          result.set(
            image.id,
            url
          );
        }
      }
    );

    return result;
  }

  /*
   * --------------------------------------------------
   * Submit
   * --------------------------------------------------
   */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!productId) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const numericPrice =
        getNumericPrice(price);

      if (!title.trim()) {
        throw new Error(
          "نام محصول را وارد کنید."
        );
      }

      if (!slug.trim()) {
        throw new Error(
          "Slug را وارد کنید."
        );
      }

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        throw new Error(
          "قیمت محصول نامعتبر است."
        );
      }

      const numericCount =
        Number(count);

      if (
        !Number.isInteger(
          numericCount
        ) ||
        numericCount < 0
      ) {
        throw new Error(
          "موجودی محصول نامعتبر است."
        );
      }

      const numericCategory =
        Number(categoryId);

      if (
        !Number.isInteger(
          numericCategory
        ) ||
        numericCategory <= 0
      ) {
        throw new Error(
          "لطفاً یک دسته‌بندی انتخاب کنید."
        );
      }

      /*
       * offer = درصد تخفیف
       */
      const numericOffer =
        offer.trim() === ""
          ? null
          : Number(offer);

      if (
        numericOffer !== null &&
        (!Number.isFinite(
          numericOffer
        ) ||
          numericOffer < 0 ||
          numericOffer > 100)
      ) {
        throw new Error(
          "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد."
        );
      }

      /*
       * Upload new images
       */
      const uploadedUrls =
        await uploadNewImages();

      /*
       * ساخت آرایه نهایی تصاویر
       *
       * ترتیب تصاویر حفظ می‌شود.
       */
      const finalImages =
        images
          .map((image) => {
            if (image.isNew) {
              return uploadedUrls.get(
                image.id
              );
            }

            return image.url;
          })
          .filter(
            (
              url
            ): url is string =>
              Boolean(url)
          );

      const body = {
        title: title.trim(),
        slug: slug.trim(),

        price: numericPrice,

        /*
         * اینجا offer درصد است.
         *
         * مثلا:
         * price = 1,000,000
         * offer = 20
         *
         * قیمت نهایی = 800,000
         */
        offer: numericOffer,

        images: finalImages,

        description:
          description.trim(),

        categoryId:
          numericCategory,

        count: numericCount,

        isFeatured,

        isActive,
      };

      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const text =
        await response.text();

      let data: {
        product?: Product;
        error?: string;
      } | null = null;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        throw new Error(
          "پاسخ سرور معتبر نیست."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "ویرایش محصول ناموفق بود."
        );
      }

      /*
       * Previewهای تصاویر جدید را آزاد می‌کنیم.
       */
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      });

      setSuccess(
        "محصول با موفقیت ذخیره شد."
      );

      /*
       * بعد از ذخیره، اطلاعات local را
       * با URLهای واقعی هماهنگ می‌کنیم.
       */
      setImages(
        finalImages.map((url) => ({
          id: createImageId(),
          url,
          isNew: false,
        }))
      );

      /*
       * کمی مکث برای نمایش پیام موفقیت
       */
      setTimeout(() => {
        router.push(
          "/private/products"
        );

        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * --------------------------------------------------
   * Price
   * --------------------------------------------------
   */

  const numericPrice =
    getNumericPrice(price);

  const numericOffer =
    offer.trim() === ""
      ? null
      : Number(offer);

  const finalPrice =
    Number.isFinite(
      numericPrice
    )
      ? getFinalPrice(
          numericPrice,
          Number.isFinite(
            numericOffer
          )
            ? numericOffer
            : null
        )
      : 0;

  const hasDiscount =
    numericOffer !== null &&
    Number.isFinite(
      numericOffer
    ) &&
    numericOffer > 0 &&
    numericOffer < 100;

  /*
   * --------------------------------------------------
   * Loading
   * --------------------------------------------------
   */

  if (loading) {
    return <EditProductSkeleton />;
  }

  /*
   * --------------------------------------------------
   * Error
   * --------------------------------------------------
   */

  if (error && !productId) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 p-5 sm:p-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
            <Package
              size={32}
              className="mx-auto text-neutral-300"
            />

            <h1 className="mt-4 text-lg font-bold text-black">
              {error}
            </h1>

            <Link
              href="/admin/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              بازگشت به محصولات
              <ArrowRight size={15} />
            </Link>
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
      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 transition hover:text-black"
            >
              <ArrowRight size={14} />
              بازگشت به محصولات
            </Link>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-black">
              ویرایش محصول
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              اطلاعات و تصاویر محصول را ویرایش کنید.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-xs font-bold ${
              isActive
                ? "bg-neutral-100 text-black"
                : "bg-neutral-200 text-neutral-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isActive
                  ? "bg-black"
                  : "bg-neutral-400"
              }`}
            />

            {isActive
              ? "محصول فعال"
              : "محصول غیرفعال"}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          {/* Basic information */}

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-base font-bold text-black">
                اطلاعات محصول
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                اطلاعات اصلی محصول را ویرایش کنید.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="نام محصول"
                value={title}
                onChange={setTitle}
                required
              />

              <Input
                label="Slug"
                value={slug}
                onChange={setSlug}
                required
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-neutral-600">
                دسته‌بندی
              </label>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                disabled={
                  categoriesLoading
                }
                className="h-11 w-full rounded-xl bg-neutral-50 px-4 text-sm text-black outline-none transition focus:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {categoriesLoading
                    ? "در حال دریافت..."
                    : "انتخاب دسته‌بندی"}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </section>

          {/* Price */}

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-base font-bold text-black">
                قیمت و موجودی
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                قیمت اصلی و درصد تخفیف محصول را تعیین کنید.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-600">
                  قیمت اصلی
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      formatInputPrice(
                        event.target.value
                      )
                    )
                  }
                  className="h-11 w-full rounded-xl bg-neutral-50 px-4 text-sm outline-none transition focus:bg-neutral-100"
                />

                {numericPrice > 0 && (
                  <p className="mt-2 text-[10px] text-neutral-400">
                    {formatPrice(
                      numericPrice
                    )}{" "}
                    تومان
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-600">
                  درصد تخفیف
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={offer}
                    onChange={(event) =>
                      setOffer(
                        event.target.value
                      )
                    }
                    placeholder="مثلاً 20"
                    className="h-11 w-full rounded-xl bg-neutral-50 px-4 pl-10 text-sm outline-none transition focus:bg-neutral-100"
                  />

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                    ٪
                  </span>
                </div>

                <p className="mt-2 text-[10px] text-neutral-400">
                  درصدی از قیمت اصلی کم می‌شود.
                </p>
              </div>

              <Input
                label="موجودی"
                type="number"
                value={count}
                onChange={setCount}
              />
            </div>

            {/* Final price preview */}

            {hasDiscount &&
              numericPrice > 0 && (
                <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-neutral-400">
                      قیمت نهایی:
                    </span>

                    <span className="text-lg font-bold text-black">
                      {formatPrice(
                        finalPrice
                      )}{" "}
                      تومان
                    </span>

                    <span className="text-xs text-neutral-400 line-through">
                      {formatPrice(
                        numericPrice
                      )}{" "}
                      تومان
                    </span>

                    <span className="rounded-full bg-black px-2 py-1 text-[10px] font-bold text-white">
                      {numericOffer}٪ تخفیف
                    </span>
                  </div>
                </div>
              )}
          </section>

          {/* Images */}

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-base font-bold text-black">
                تصاویر محصول
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                تصویر اول به عنوان تصویر اصلی محصول استفاده می‌شود.
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images.map(
                  (image, index) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(
                          event,
                          index
                        )
                      }
                      onDragOver={(event) =>
                        event.preventDefault()
                      }
                      onDrop={(event) =>
                        handleDrop(
                          event,
                          index
                        )
                      }
                      className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
                    >
                      <img
                        src={
                          image.isNew
                            ? image.preview
                            : image.url
                        }
                        alt={`${title} - ${index + 1}`}
                        className="h-full w-full object-contain"
                      />

                      {/* Drag */}

                      <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
                        <GripVertical
                          size={15}
                        />
                      </div>

                      {/* Delete */}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            image.id
                          )
                        }
                        className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                      >
                        <Trash2
                          size={14}
                        />
                      </button>

                      {/* Move buttons */}

                      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={
                            index === 0
                          }
                          onClick={() =>
                            moveImage(
                              index,
                              "left"
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white disabled:opacity-30"
                        >
                          ←
                        </button>

                        <button
                          type="button"
                          disabled={
                            index ===
                            images.length -
                              1
                          }
                          onClick={() =>
                            moveImage(
                              index,
                              "right"
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white disabled:opacity-30"
                        >
                          →
                        </button>
                      </div>

                      {/* Main image */}

                      {index === 0 && (
                        <span className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-[9px] font-bold text-black">
                          تصویر اصلی
                        </span>
                      )}

                      {/* New image */}

                      {image.isNew && (
                        <span className="absolute bottom-2 left-2 rounded-lg bg-black px-2 py-1 text-[9px] font-bold text-white">
                          جدید
                        </span>
                      )}
                    </div>
                  )
                )}

                {/* Add */}

                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-black">
                  <ImagePlus
                    size={24}
                  />

                  <span className="mt-2 text-xs font-semibold">
                    افزودن تصویر
                  </span>

                  <span className="mt-1 text-[9px]">
                    JPG, PNG, WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleImagesChange
                    }
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {images.length === 0 && (
              <label className="flex aspect-[2/1] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-black">
                <ImagePlus
                  size={28}
                />

                <span className="mt-3 text-sm font-semibold">
                  افزودن تصاویر محصول
                </span>

                <span className="mt-1 text-[10px]">
                  JPG, PNG, WEBP — حداکثر ۵MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={
                    handleImagesChange
                  }
                  className="hidden"
                />
              </label>
            )}

            <p className="mt-4 text-[10px] text-neutral-400">
              می‌توانید تصاویر را با کشیدن جابه‌جا کنید. تصویر اول، تصویر اصلی محصول است.
            </p>
          </section>

          {/* Description */}

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="mb-4">
              <h2 className="text-base font-bold text-black">
                توضیحات
              </h2>
            </div>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={7}
              placeholder="توضیحات محصول..."
              className="w-full resize-none rounded-2xl bg-neutral-50 p-4 text-sm leading-7 outline-none transition focus:bg-neutral-100"
            />
          </section>

          {/* Settings */}

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                checked={isFeatured}
                onChange={
                  setIsFeatured
                }
                title="محصول منتخب"
                description="محصول به عنوان محصول ویژه نمایش داده شود."
              />

              <Toggle
                checked={isActive}
                onChange={setIsActive}
                title="محصول فعال"
                description="محصول در فروشگاه برای کاربران قابل مشاهده باشد."
              />
            </div>
          </section>

          {/* Error */}

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="rounded-2xl bg-neutral-100 p-4 text-xs font-semibold text-black">
              {success}
            </div>
          )}

          {/* Save */}

          <div className="sticky bottom-4 z-20">
            <button
              type="submit"
              disabled={saving}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm font-bold text-white shadow-xl transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} />

              {saving
                ? "در حال ذخیره تغییرات..."
                : "ذخیره تغییرات"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/*
 * --------------------------------------------------
 * Input
 * --------------------------------------------------
 */

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-neutral-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-11 w-full rounded-xl bg-neutral-50 px-4 text-sm outline-none transition focus:bg-neutral-100"
      />
    </div>
  );
}

/*
 * --------------------------------------------------
 * Toggle
 * --------------------------------------------------
 */

function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-neutral-50 p-4">
      <div>
        <p className="text-sm font-bold text-black">
          {title}
        </p>

        <p className="mt-1 text-[10px] text-neutral-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-black"
            : "bg-neutral-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "right-1"
              : "right-6"
          }`}
        />
      </button>
    </label>
  );
}

/*
 * --------------------------------------------------
 * Skeleton
 * --------------------------------------------------
 */

function EditProductSkeleton() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50"
    >
      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />

        <div className="mt-5 h-10 w-52 animate-pulse rounded-xl bg-neutral-200" />

        <div className="mt-8 space-y-6">
          <SkeletonSection />

          <SkeletonSection />

          <div className="rounded-3xl bg-white p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-2xl bg-neutral-200"
                />
              ))}
            </div>
          </div>

          <SkeletonSection />
        </div>
      </div>
    </main>
  );
}

function SkeletonSection() {
  return (
    <div className="rounded-3xl bg-white p-7">
      <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="h-11 animate-pulse rounded-xl bg-neutral-200" />

        <div className="h-11 animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}