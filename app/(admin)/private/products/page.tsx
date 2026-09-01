"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  ImagePlus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/adminSidebar";

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
  category?: {
    id: number;
    name: string;
  } | null;
};

type ProductsResponse = {
  products?: Product[];
  nextCursor?: number | null;
  hasNextPage?: boolean;
};

type Category = {
  id: number;
  name: string;
};


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

function formatToman(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Number(value)
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [showCreate, setShowCreate] = useState(false);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/products", {
        method: "GET",
        cache: "no-store",
      });
      
      const text = await response.text();
      
      let data;
      
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error("پاسخ سرور JSON معتبر نیست.");
      }
      
      if (!response.ok) {
        throw new Error(
          data?.error || "خطا در دریافت محصولات"
        );
      }


      if (response.status === 401 || response.status === 403) {
        throw new Error("دسترسی به پنل ادمین ندارید.");
      }

      if (!response.ok) {
        throw new Error(
          data.error || "خطا در دریافت محصولات"
        );
      }

      setProducts(data.products ?? []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "خطایی رخ داده است."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `آیا مطمئن هستید که «${product.title}» غیرفعال شود؟`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "حذف محصول ناموفق بود."
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                isActive: false,
              }
            : item
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "خطایی رخ داد."
      );
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.slug
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        status === "all" ||
        (status === "active" && product.isActive) ||
        (status === "inactive" && !product.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  if (loading) {
    return <ProductsSkeleton />;
  }

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 p-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
            <Package
              size={32}
              className="mx-auto text-neutral-300"
            />

            <h1 className="mt-4 text-lg font-bold text-black">
              {error}
            </h1>

            <button
              onClick={loadProducts}
              className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
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

  <div className="">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-black">
              محصولات
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              مدیریت محصولات فروشگاه
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            <Plus size={17} />
            افزودن محصول
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="همه محصولات"
            value={products.length}
          />

          <StatCard
            title="فعال"
            value={
              products.filter(
                (product) => product.isActive
              ).length
            }
          />

          <StatCard
            title="غیرفعال"
            value={
              products.filter(
                (product) => !product.isActive
              ).length
            }
          />

          <StatCard
            title="موجودی کم"
            value={
              products.filter(
                (product) =>
                  product.isActive &&
                  product.count <= 5
              ).length
            }
          />
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="جستجوی محصول..."
                className="h-11 w-full rounded-xl bg-neutral-50 pr-11 pl-4 text-sm outline-none transition focus:bg-neutral-100"
              />
            </div>

            <div className="flex rounded-xl bg-neutral-50 p-1">
              <FilterButton
                active={status === "all"}
                onClick={() => setStatus("all")}
              >
                همه
              </FilterButton>

              <FilterButton
                active={status === "active"}
                onClick={() => setStatus("active")}
              >
                فعال
              </FilterButton>

              <FilterButton
                active={status === "inactive"}
                onClick={() => setStatus("inactive")}
              >
                غیرفعال
              </FilterButton>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">

          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-right">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    محصول
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    قیمت
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    موجودی
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    فروش
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    وضعیت
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-neutral-400">
                    عملیات
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-neutral-100 lg:hidden">
            {filteredProducts.map((product) => (
              <ProductMobileCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="px-6 py-20 text-center">
              <Package
                size={30}
                className="mx-auto text-neutral-300"
              />

              <p className="mt-4 text-sm font-semibold text-neutral-500">
                محصولی پیدا نشد
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateProductModal
          onClose={() => setShowCreate(false)}
          onCreated={(product) => {
            setProducts((current) => [
              product,
              ...current,
            ]);

            setShowCreate(false);
          }}
        />
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
        {new Intl.NumberFormat("fa-IR").format(value)}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-black text-white"
          : "text-neutral-500 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

function ProductRow({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (product: Product) => void;
}) {
  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <ProductImage product={product} />

          <div>
            <p className="max-w-64 truncate text-sm font-bold text-black">
              {product.title}
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              {product.category?.name ??
                "بدون دسته‌بندی"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-bold text-black">
            {formatPrice(
              product.offer ?? product.price
            )}{" "}
            تومان
          </p>

          {product.offer !== null &&
            Number(product.offer) <
              Number(product.price) && (
              <p className="mt-1 text-xs text-neutral-400 line-through">
                {formatPrice(product.price)}
              </p>
            )}
        </div>
      </td>

      <td className="px-6 py-4">
        <StockBadge count={product.count} />
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-neutral-600">
          {new Intl.NumberFormat("fa-IR").format(
            product.purchaseCount
          )}
        </span>
      </td>

      <td className="px-6 py-4">
        <StatusBadge active={product.isActive} />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/products/${product.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition hover:bg-black hover:text-white"
          >
            <Edit3 size={15} />
          </Link>

          {product.isActive && (
            <button
              onClick={() => onDelete(product)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function ProductMobileCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="p-4">
      <div className="flex gap-4">
        <ProductImage product={product} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-black">
                {product.title}
              </h3>

              <p className="mt-1 text-xs text-neutral-400">
                {product.category?.name ??
                  "بدون دسته‌بندی"}
              </p>
            </div>

            <StatusBadge active={product.isActive} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-[10px] text-neutral-400">
                قیمت
              </p>

              <p className="mt-1 text-xs font-bold text-black">
                {formatPrice(
                  product.offer ?? product.price
                )}{" "}
                تومان
              </p>
            </div>

            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-[10px] text-neutral-400">
                موجودی
              </p>

              <p className="mt-1 text-xs font-bold text-black">
                {new Intl.NumberFormat("fa-IR").format(
                  product.count
                )}
              </p>
            </div>

            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-[10px] text-neutral-400">
                فروش
              </p>

              <p className="mt-1 text-xs font-bold text-black">
                {new Intl.NumberFormat("fa-IR").format(
                  product.purchaseCount
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href={`/admin/products/${product.id}`}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-black text-xs font-semibold text-white"
            >
              <Edit3 size={14} />
              ویرایش
            </Link>

            {product.isActive && (
              <button
                onClick={() => onDelete(product)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductImage({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
      {product.images?.[0] ? (
        <img
          src={product.images[0]}
          alt={product.title}
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
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "bg-neutral-100 text-black"
          : "bg-neutral-100 text-neutral-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-black"
            : "bg-neutral-300"
        }`}
      />

      {active ? "فعال" : "غیرفعال"}
    </span>
  );
}

function StockBadge({
  count,
}: {
  count: number;
}) {
  const low = count <= 5;
  const empty = count === 0;

  return (
    <span
      className={`text-sm font-semibold ${
        empty
          ? "text-neutral-300"
          : low
            ? "text-neutral-500"
            : "text-black"
      }`}
    >
      {new Intl.NumberFormat("fa-IR").format(count)}

      {low && (
        <span className="mr-2 text-[10px] font-medium">
          {empty ? "ناموجود" : "موجودی کم"}
        </span>
      )}
    </span>
  );
}

function CreateProductModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (product: Product) => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");

  const [count, setCount] = useState("0");

  const [categoryId, setCategoryId] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [isFeatured, setIsFeatured] =
    useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [images, setImages] = useState<
    {
      file: File;
      preview: string;
    }[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * --------------------------------------------------
   * Categories
   * --------------------------------------------------
   */

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        /*
         * فعلاً از API عمومی دسته‌بندی‌ها استفاده می‌کنیم.
         *
         * اگر API ادمین categories داری:
         *
         * /api/admin/categories
         *
         * را اینجا قرار بده.
         */

        const response = await fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

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
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "خطا در دریافت دسته‌بندی‌ها"
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

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }

      /*
       * حداکثر 5MB برای هر عکس
       */
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }

      return true;
    });

    const newImages = validFiles.map(
      (file) => ({
        file,
        preview: URL.createObjectURL(file),
      })
    );

    setImages((current) => [
      ...current,
      ...newImages,
    ]);

    /*
     * اجازه انتخاب دوباره همان فایل
     */
    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((current) => {
      const image = current[index];

      if (image?.preview) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return current.filter(
        (_, i) => i !== index
      );
    });
  }

  /*
   * --------------------------------------------------
   * Cloud upload
   * --------------------------------------------------
   *
   * فعلاً فقط URL فرضی تولید نمی‌کنیم.
   *
   * این تابع جای اتصال Cloudinary / S3 / Storage
   * خواهد بود.
   *
   * بعداً فقط همین تابع را تغییر می‌دهیم.
   */

  async function uploadImages(
    files: File[]
  ): Promise<string[]> {
    /*
     * TODO:
     *
     * مثلاً:
     *
     * const formData = new FormData();
     *
     * files.forEach((file) => {
     *   formData.append("files", file);
     * });
     *
     * const response = await fetch(
     *   "/api/admin/uploads",
     *   {
     *     method: "POST",
     *     body: formData,
     *   }
     * );
     *
     * const data = await response.json();
     *
     * return data.urls;
     */

    /*
     * چون فعلاً سیستم Cloud فعال نیست،
     * اجازه ثبت واقعی را نمی‌دهیم.
     */

    throw new Error(
      "سیستم آپلود تصاویر هنوز فعال نشده است."
    );
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

    try {
      setLoading(true);
      setError("");

      if (!categoryId) {
        throw new Error(
          "لطفاً یک دسته‌بندی انتخاب کنید."
        );
      }

      if (!price) {
        throw new Error(
          "قیمت محصول را وارد کنید."
        );
      }

      /*
       * فعلاً چون Cloud فعال نیست،
       * این قسمت را اجرا نمی‌کنیم.
       *
       * وقتی سیستم آپلود آماده شد:
       *
       * const imageUrls =
       *   await uploadImages(
       *     images.map((item) => item.file)
       *   );
       */

      const imageUrls: string[] = [];

      const body = {
        title: title.trim(),
        slug: slug.trim(),

        price: getNumericPrice(price),

        offer: offer
          ? getNumericPrice(offer)
          : null,

        images: imageUrls,

        description,

        categoryId:
          Number(categoryId),

        count: Number(count),

        isFeatured,

        isActive: true,
      };

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const text =
        await response.text();

      let data;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        throw new Error(
          "پاسخ سرور JSON معتبر نیست."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "ساخت محصول ناموفق بود."
        );
      }

      onCreated(data.product);
    } catch (error) {
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
    <div
      className="
        fixed inset-0 z-101
        flex items-center justify-center
        bg-black/40 p-4
        backdrop-blur-sm
      "
    >
      <div
        dir="rtl"
        className="
          max-h-[92vh]
          w-full max-w-3xl
          overflow-y-auto
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
          sm:p-8
        "
      >
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-black">
              افزودن محصول
            </h2>

            <p className="mt-1 text-xs text-neutral-400">
              محصول جدید به فروشگاه اضافه کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              bg-neutral-100
              text-neutral-500
              transition
              hover:bg-neutral-200
              hover:text-black
            "
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-6"
        >
          {/* Basic */}

          <div>
            <div className="mb-3">
              <p className="text-sm font-bold text-black">
                اطلاعات محصول
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                اطلاعات اصلی محصول را وارد کنید.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          {/* Category */}

          <div>
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
              required
              disabled={
                categoriesLoading
              }
              className="
                h-11 w-full
                rounded-xl
                bg-neutral-50
                px-4
                text-sm
                text-black
                outline-none
                transition
                focus:bg-neutral-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option value="">
                {categoriesLoading
                  ? "در حال دریافت دسته‌بندی‌ها..."
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

          {/* Prices */}

          <div>
            <div className="mb-3">
              <p className="text-sm font-bold text-black">
                قیمت و موجودی
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Price */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-600">
                  قیمت
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
                  required
                  placeholder="1,500,000"
                  className="
                    h-11 w-full
                    rounded-xl
                    bg-neutral-50
                    px-4
                    text-sm
                    outline-none
                    transition
                    focus:bg-neutral-100
                  "
                />

                <PricePreview
                  value={price}
                />
              </div>

              {/* Offer */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-600">
                  قیمت تخفیف
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={offer}
                  onChange={(event) =>
                    setOffer(
                      formatInputPrice(
                        event.target.value
                      )
                    )
                  }
                  placeholder="1,200,000"
                  className="
                    h-11 w-full
                    rounded-xl
                    bg-neutral-50
                    px-4
                    text-sm
                    outline-none
                    transition
                    focus:bg-neutral-100
                  "
                />

                <PricePreview
                  value={offer}
                />
              </div>

              {/* Count */}

              <Input
                label="موجودی"
                type="number"
                value={count}
                onChange={setCount}
              />
            </div>
          </div>

          {/* Images */}

          <div>
            <div className="mb-3">
              <p className="text-sm font-bold text-black">
                تصاویر محصول
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                چند تصویر برای محصول انتخاب کنید.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map(
                (image, index) => (
                  <div
                    key={`${image.file.name}-${index}`}
                    className="
                      group relative
                      aspect-square
                      overflow-hidden
                      rounded-2xl
                      bg-neutral-100
                    "
                  >
                    <img
                      src={image.preview}
                      alt={`تصویر ${index + 1}`}
                      className="
                        h-full w-full
                        object-contain
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(index)
                      }
                      className="
                        absolute
                        left-2 top-2
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-black/70
                        text-white
                        opacity-0
                        transition
                        group-hover:opacity-100
                      "
                    >
                      <Trash2
                        size={14}
                      />
                    </button>

                    {index === 0 && (
                      <span
                        className="
                          absolute
                          bottom-2 right-2
                          rounded-lg
                          bg-white/90
                          px-2 py-1
                          text-[9px]
                          font-bold
                          text-black
                        "
                      >
                        تصویر اصلی
                      </span>
                    )}
                  </div>
                )
              )}

              {/* Add image */}

              <label
                className="
                  flex aspect-square
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border-2
                  border-dashed
                  border-neutral-200
                  bg-neutral-50
                  text-neutral-400
                  transition
                  hover:border-neutral-400
                  hover:bg-neutral-100
                  hover:text-black
                "
              >
                <ImagePlus size={22} />

                <span className="mt-2 text-xs font-semibold">
                  افزودن تصویر
                </span>

                <span className="mt-1 text-[9px] text-neutral-400">
                  چند تصویر
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

            {images.length === 0 && (
              <p className="mt-3 text-[11px] text-neutral-400">
                هنوز تصویری انتخاب نشده است.
              </p>
            )}

            <p className="mt-3 text-[10px] text-neutral-400">
              فرمت‌های مجاز: JPG, PNG, WEBP — حداکثر ۵MB برای هر تصویر
            </p>
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-600">
              توضیحات
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={5}
              className="
                w-full
                resize-none
                rounded-xl
                bg-neutral-50
                p-4
                text-sm
                outline-none
                transition
                focus:bg-neutral-100
              "
              placeholder="توضیحات محصول..."
            />
          </div>

          {/* Featured */}

          <label
            className="
              flex cursor-pointer
              items-center gap-3
              rounded-xl
              bg-neutral-50
              p-4
            "
          >
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) =>
                setIsFeatured(
                  event.target.checked
                )
              }
              className="
                h-4 w-4
                accent-black
              "
            />

            <div>
              <p className="text-sm font-semibold text-neutral-700">
                محصول منتخب باشد
              </p>

              <p className="mt-0.5 text-[10px] text-neutral-400">
                این محصول به عنوان محصول ویژه نمایش داده شود.
              </p>
            </div>
          </label>

          {/* Error */}

          {error && (
            <div
              className="
                rounded-xl
                bg-red-50
                p-4
                text-xs
                font-semibold
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="
              h-12 w-full
              rounded-xl
              bg-black
              text-sm
              font-bold
              text-white
              transition
              hover:bg-neutral-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "در حال ایجاد..."
              : "ایجاد محصول"}
          </button>
        </form>
      </div>
    </div>
  );
}

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
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl bg-neutral-50 px-4 text-sm outline-none transition focus:bg-neutral-100"
      />
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50"
    >
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-neutral-200" />

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-neutral-200"
              />
            )
          )}
        </div>

        <div className="mt-8 h-20 animate-pulse rounded-2xl bg-neutral-200" />

        <div className="mt-5 overflow-hidden rounded-2xl bg-white">
          {Array.from({ length: 7 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse border-b border-neutral-100 bg-neutral-100"
              />
            )
          )}
        </div>
      </div>
    </main>
  );
}

function PricePreview({
  value,
}: {
  value: string;
}) {
  if (!value) {
    return null;
  }

  const number = getNumericPrice(value);

  if (!number) {
    return null;
  }

  return (
    <p className="mt-2 text-[10px] font-medium text-neutral-400">
      {formatToman(number)} تومان
    </p>
  );
}