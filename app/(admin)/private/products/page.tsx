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
  slug?: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/*
|--------------------------------------------------------------------------
| Price helpers
|--------------------------------------------------------------------------
*/

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
  return new Intl.NumberFormat("fa-IR").format(
    Math.round(value)
  );
}

function formatPrice(value: number | string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "۰";
  }

  return new Intl.NumberFormat("fa-IR").format(
    Math.round(number)
  );
}

/*
|--------------------------------------------------------------------------
| Discount helpers
|--------------------------------------------------------------------------
|
| offer = percentage
|
| Example:
| price = 1,000,000
| offer = 20
|
| final price = 800,000
|
*/

function calculateDiscountedPrice(
  price: number | string,
  offer: number | string | null
) {
  const numericPrice = Number(price);
  const numericOffer = Number(offer ?? 0);

  if (
    !Number.isFinite(numericPrice) ||
    !Number.isFinite(numericOffer)
  ) {
    return 0;
  }

  const safeOffer = Math.min(
    Math.max(numericOffer, 0),
    100
  );

  return numericPrice * (1 - safeOffer / 100);
}

function getOfferNumber(
  offer: number | string | null
) {
  if (
    offer === null ||
    offer === undefined ||
    offer === ""
  ) {
    return 0;
  }

  const value = Number(offer);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value;
}

/*
|--------------------------------------------------------------------------
| Image signature validation
|--------------------------------------------------------------------------
*/

async function hasValidImageSignature(
  file: File
): Promise<boolean> {
  const buffer = await file
    .slice(0, 12)
    .arrayBuffer();

  const bytes = new Uint8Array(buffer);

  // JPEG
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return true;
  }

  // PNG
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return true;
  }

  // WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}

/*
|--------------------------------------------------------------------------
| Main page
|--------------------------------------------------------------------------
*/

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [showCreate, setShowCreate] =
    useState(false);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/products",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const text = await response.text();

      let data: ProductsResponse & {
        error?: string;
      };

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
          "دسترسی به پنل ادمین ندارید."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "خطا در دریافت محصولات."
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

  async function handleDelete(
    product: Product
  ) {
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

      const text = await response.text();

      let data: {
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
            "حذف محصول ناموفق بود."
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
        (status === "active" &&
          product.isActive) ||
        (status === "inactive" &&
          !product.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
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
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
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
            onClick={() =>
              setShowCreate(true)
            }
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
                (product) =>
                  product.isActive
              ).length
            }
          />

          <StatCard
            title="غیرفعال"
            value={
              products.filter(
                (product) =>
                  !product.isActive
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
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="جستجوی محصول..."
                className="h-11 w-full rounded-xl bg-neutral-50 pr-11 pl-4 text-sm outline-none transition focus:bg-neutral-100"
              />
            </div>

            <div className="flex rounded-xl bg-neutral-50 p-1">
              <FilterButton
                active={status === "all"}
                onClick={() =>
                  setStatus("all")
                }
              >
                همه
              </FilterButton>

              <FilterButton
                active={
                  status === "active"
                }
                onClick={() =>
                  setStatus("active")
                }
              >
                فعال
              </FilterButton>

              <FilterButton
                active={
                  status === "inactive"
                }
                onClick={() =>
                  setStatus("inactive")
                }
              >
                غیرفعال
              </FilterButton>
            </div>
          </div>
        </div>

        {/* Products */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {/* Desktop */}

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
                {filteredProducts.map(
                  (product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onDelete={handleDelete}
                    />
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}

          <div className="divide-y divide-neutral-100 lg:hidden">
            {filteredProducts.map(
              (product) => (
                <ProductMobileCard
                  key={product.id}
                  product={product}
                  onDelete={handleDelete}
                />
              )
            )}
          </div>

          {filteredProducts.length ===
            0 && (
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

      {showCreate && (
        <CreateProductModal
          onClose={() =>
            setShowCreate(false)
          }
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

/*
|--------------------------------------------------------------------------
| Stat
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Filter
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Product row
|--------------------------------------------------------------------------
*/

function ProductRow({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (
    product: Product
  ) => void;
}) {
  const offer = getOfferNumber(
    product.offer
  );

  const finalPrice =
    calculateDiscountedPrice(
      product.price,
      product.offer
    );

  const hasDiscount =
    offer > 0;

  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <ProductImage
            product={product}
          />

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

      {/* Price */}

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-black">
              {formatPrice(
                finalPrice
              )}{" "}
              تومان
            </p>

            {hasDiscount && (
              <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold text-neutral-500">
                {formatPrice(offer)}٪
              </span>
            )}
          </div>

          {hasDiscount && (
            <p className="mt-1 text-xs text-neutral-400 line-through">
              {formatPrice(
                product.price
              )}{" "}
              تومان
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <StockBadge
          count={product.count}
        />
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-neutral-600">
          {new Intl.NumberFormat(
            "fa-IR"
          ).format(
            product.purchaseCount
          )}
        </span>
      </td>

      <td className="px-6 py-4">
        <StatusBadge
          active={product.isActive}
        />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/private/products/${product.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition hover:bg-black hover:text-white"
          >
            <Edit3 size={15} />
          </Link>

          {product.isActive && (
            <button
              onClick={() =>
                onDelete(product)
              }
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

/*
|--------------------------------------------------------------------------
| Mobile product
|--------------------------------------------------------------------------
*/

function ProductMobileCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (
    product: Product
  ) => void;
}) {
  const offer = getOfferNumber(
    product.offer
  );

  const finalPrice =
    calculateDiscountedPrice(
      product.price,
      product.offer
    );

  const hasDiscount =
    offer > 0;

  return (
    <div className="p-4">
      <div className="flex gap-4">
        <ProductImage
          product={product}
        />

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

            <StatusBadge
              active={product.isActive}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {/* Price */}

            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-[10px] text-neutral-400">
                قیمت
              </p>

              <p className="mt-1 text-xs font-bold text-black">
                {formatPrice(
                  finalPrice
                )}{" "}
                تومان
              </p>

              {hasDiscount && (
                <>
                  <p className="mt-1 text-[10px] text-neutral-400 line-through">
                    {formatPrice(
                      product.price
                    )}
                  </p>

                  <p className="mt-1 text-[9px] font-bold text-neutral-500">
                    {formatPrice(
                      offer
                    )}
                    ٪ تخفیف
                  </p>
                </>
              )}
            </div>

            {/* Stock */}

            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-[10px] text-neutral-400">
                موجودی
              </p>

              <p className="mt-1 text-xs font-bold text-black">
                {new Intl.NumberFormat(
                  "fa-IR"
                ).format(
                  product.count
                )}
              </p>
            </div>

            {/* Sales */}

            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <p className="text-[10px] text-neutral-400">
                فروش
              </p>

              <p className="mt-1 text-xs font-bold text-black">
                {new Intl.NumberFormat(
                  "fa-IR"
                ).format(
                  product.purchaseCount
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href={`/private/products/${product.id}`}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-black text-xs font-semibold text-white"
            >
              <Edit3 size={14} />
              ویرایش
            </Link>

            {product.isActive && (
              <button
                onClick={() =>
                  onDelete(product)
                }
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

/*
|--------------------------------------------------------------------------
| Product image
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Stock
|--------------------------------------------------------------------------
*/

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
      {new Intl.NumberFormat(
        "fa-IR"
      ).format(count)}

      {low && (
        <span className="mr-2 text-[10px] font-medium">
          {empty
            ? "ناموجود"
            : "موجودی کم"}
        </span>
      )}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Create product modal
|--------------------------------------------------------------------------
*/

function CreateProductModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (
    product: Product
  ) => void;
}) {
  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [price, setPrice] =
    useState("");

  /*
   * Offer is percentage.
   *
   * Example:
   * 20 = 20%
   */

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

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(true);

  const [
    showCreateCategory,
    setShowCreateCategory,
  ] = useState(false);

  const [images, setImages] =
    useState<
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
  |--------------------------------------------------------------------------
  | Cleanup previews
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(
          image.preview
        );
      });
    };
  }, [images]);

  /*
  |--------------------------------------------------------------------------
  | Load categories
  |--------------------------------------------------------------------------
  */

  async function loadCategories() {
    try {
      setCategoriesLoading(true);

      const response = await fetch(
        "/api/categories",
        {
          cache: "no-store",
        }
      );

      const text =
        await response.text();

      let data: {
        categories?: Category[];
        error?: string;
        message?: string;
      } = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "پاسخ سرور دسته‌بندی‌ها معتبر نیست."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
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
          : "خطا در دریافت دسته‌بندی‌ها."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Images
  |--------------------------------------------------------------------------
  */

  async function handleImagesChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (!files.length) {
      return;
    }

    setError("");

    const remainingSlots =
      MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError(
        `حداکثر ${MAX_IMAGES} تصویر می‌توانید انتخاب کنید.`
      );

      return;
    }

    const selectedFiles =
      files.slice(0, remainingSlots);

    const rejected: string[] = [];

    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      if (
        !ALLOWED_IMAGE_TYPES.has(
          file.type
        )
      ) {
        rejected.push(
          `${file.name}: فرمت مجاز نیست`
        );

        continue;
      }

      if (
        file.size <= 0 ||
        file.size > MAX_IMAGE_SIZE
      ) {
        rejected.push(
          `${file.name}: حجم باید حداکثر 5MB باشد`
        );

        continue;
      }

      try {
        const validSignature =
          await hasValidImageSignature(
            file
          );

        if (!validSignature) {
          rejected.push(
            `${file.name}: فایل تصویر معتبر نیست`
          );

          continue;
        }
      } catch {
        rejected.push(
          `${file.name}: بررسی فایل ناموفق بود`
        );

        continue;
      }

      validFiles.push(file);
    }

    if (rejected.length > 0) {
      setError(
        rejected.join(" | ")
      );
    }

    const newImages =
      validFiles.map((file) => ({
        file,
        preview:
          URL.createObjectURL(file),
      }));

    if (newImages.length > 0) {
      setImages((current) => [
        ...current,
        ...newImages,
      ]);
    }
  }

  function removeImage(
    index: number
  ) {
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
  |--------------------------------------------------------------------------
  | Upload images
  |--------------------------------------------------------------------------
  */

  async function uploadImages(
    files: File[]
  ): Promise<string[]> {
    if (files.length === 0) {
      throw new Error(
        "حداقل باید یک عکس آپلود شود."
      );
    }

    if (files.length > MAX_IMAGES) {
      throw new Error(
        `حداکثر ${MAX_IMAGES} تصویر مجاز است.`
      );
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append(
        "files",
        file
      );
    });

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
    } = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      throw new Error(
        "پاسخ سرور آپلود معتبر نیست."
      );
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        "دسترسی به آپلود تصاویر ندارید."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          "آپلود تصاویر ناموفق بود."
      );
    }

    if (
      !data.success ||
      !Array.isArray(data.urls) ||
      data.urls.length !== files.length
    ) {
      throw new Error(
        "آدرس تصاویر از سرور دریافت نشد."
      );
    }

    return data.urls;
  }

  /*
  |--------------------------------------------------------------------------
  | Submit product
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const trimmedTitle =
        title.trim();

      const trimmedSlug =
        slug.trim();

      if (!trimmedTitle) {
        throw new Error(
          "نام محصول را وارد کنید."
        );
      }

      if (!trimmedSlug) {
        throw new Error(
          "Slug محصول را وارد کنید."
        );
      }

      if (!categoryId) {
        throw new Error(
          "لطفاً یک دسته‌بندی انتخاب کنید."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Price
      |--------------------------------------------------------------------------
      */

      const numericPrice =
        getNumericPrice(price);

      if (
        !price ||
        !Number.isSafeInteger(
          numericPrice
        ) ||
        numericPrice <= 0
      ) {
        throw new Error(
          "قیمت محصول معتبر نیست."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Offer
      |--------------------------------------------------------------------------
      |
      | offer is percentage.
      |
      | 20 => 20%
      |
      */

      let numericOffer = 0;

      if (offer.trim()) {
        numericOffer =
          Number(
            offer.replace(/,/g, "")
          );

        if (
          !Number.isFinite(
            numericOffer
          ) ||
          numericOffer < 0 ||
          numericOffer > 100
        ) {
          throw new Error(
            "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد."
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Count
      |--------------------------------------------------------------------------
      */

      const numericCount =
        Number(count);

      if (
        !Number.isInteger(
          numericCount
        ) ||
        numericCount < 0
      ) {
        throw new Error(
          "موجودی محصول معتبر نیست."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Images
      |--------------------------------------------------------------------------
      */

      if (images.length === 0) {
        throw new Error(
          "حداقل یک تصویر برای محصول انتخاب کنید."
        );
      }

      if (images.length > MAX_IMAGES) {
        throw new Error(
          `حداکثر ${MAX_IMAGES} تصویر مجاز است.`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Upload
      |--------------------------------------------------------------------------
      */

      const uploadedUrls =
        await uploadImages(
          images.map(
            (image) => image.file
          )
        );

      /*
      |--------------------------------------------------------------------------
      | Create product
      |--------------------------------------------------------------------------
      */

      const body = {
        title: trimmedTitle,

        slug: trimmedSlug,

        price: numericPrice,

        /*
         * Percentage
         *
         * Example:
         * 20 = 20%
         */
        offer: numericOffer,

        images: uploadedUrls,

        description:
          description.trim(),

        categoryId:
          Number(categoryId),

        count: numericCount,

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

      let data: {
        product?: Product;
        error?: string;
        message?: string;
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
          "دسترسی به ساخت محصول ندارید."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "ساخت محصول ناموفق بود."
        );
      }

      if (!data.product) {
        throw new Error(
          "محصول ایجاد شد ولی اطلاعات آن از سرور دریافت نشد."
        );
      }

      onCreated(data.product);
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

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div
          dir="rtl"
          className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
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
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-black">
                    دسته‌بندی
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    محصول را در یک دسته قرار دهید.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateCategory(
                      true
                    )
                  }
                  disabled={loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-neutral-100 px-3 text-xs font-semibold text-neutral-600 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={14} />
                  دسته جدید
                </button>
              </div>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                required
                disabled={
                  categoriesLoading ||
                  loading
                }
                className="h-11 w-full rounded-xl bg-neutral-50 px-4 text-sm text-black outline-none transition focus:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
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

                <p className="mt-1 text-xs text-neutral-400">
                  تخفیف به صورت درصدی محاسبه می‌شود.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Price */}

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
                    required
                    placeholder="1,500,000"
                    className="h-11 w-full rounded-xl bg-neutral-50 px-4 text-sm outline-none transition focus:bg-neutral-100"
                  />

                  <PricePreview
                    value={price}
                  />
                </div>

                {/* Offer */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-600">
                    تخفیف
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={offer}
                      onChange={(event) => {
                        const value =
                          event.target.value.replace(
                            /[^\d.]/g,
                            ""
                          );

                        setOffer(value);
                      }}
                      placeholder="20"
                      className="h-11 w-full rounded-xl bg-neutral-50 px-4 pl-10 text-sm outline-none transition focus:bg-neutral-100"
                    />

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                      ٪
                    </span>
                  </div>

                  <DiscountPreview
                    price={price}
                    offer={offer}
                  />
                </div>

                {/* Count */}

                <Input
                  label="موجودی"
                  type="number"
                  value={count}
                  onChange={setCount}
                  min={0}
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
                      key={`${image.file.name}-${image.file.lastModified}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
                    >
                      <img
                        src={image.preview}
                        alt={`تصویر ${
                          index + 1
                        }`}
                        className="h-full w-full object-contain"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        disabled={loading}
                        className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>

                      {index === 0 && (
                        <span className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-[9px] font-bold text-black">
                          تصویر اصلی
                        </span>
                      )}
                    </div>
                  )
                )}

                {images.length <
                  MAX_IMAGES && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-black">
                    <ImagePlus size={22} />

                    <span className="mt-2 text-xs font-semibold">
                      افزودن تصویر
                    </span>

                    <span className="mt-1 text-[9px] text-neutral-400">
                      {images.length}/
                      {MAX_IMAGES}
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={
                        handleImagesChange
                      }
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {images.length ===
                0 && (
                <p className="mt-3 text-[11px] text-neutral-400">
                  هنوز تصویری انتخاب نشده است.
                </p>
              )}

              <p className="mt-3 text-[10px] text-neutral-400">
                JPG, PNG, WEBP — حداکثر ۵MB برای هر تصویر — حداکثر{" "}
                {MAX_IMAGES} تصویر
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
                className="w-full resize-none rounded-xl bg-neutral-50 p-4 text-sm outline-none transition focus:bg-neutral-100"
                placeholder="توضیحات محصول..."
              />
            </div>

            {/* Featured */}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-neutral-50 p-4">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) =>
                  setIsFeatured(
                    event.target.checked
                  )
                }
                disabled={loading}
                className="h-4 w-4 accent-black"
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
              <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-black text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "در حال ایجاد..."
                : "ایجاد محصول"}
            </button>
          </form>
        </div>
      </div>

      {/* Create category */}

      {showCreateCategory && (
        <CreateCategoryModal
          onClose={() =>
            setShowCreateCategory(
              false
            )
          }
          onCreated={(category) => {
            setCategories(
              (current) => [
                ...current,
                category,
              ]
            );

            setCategoryId(
              String(category.id)
            );

            setShowCreateCategory(
              false
            );
          }}
        />
      )}
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Create category modal
|--------------------------------------------------------------------------
*/

function CreateCategoryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (
    category: Category
  ) => void;
}) {
  const [name, setName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Generate a simple slug.
   *
   * Persian characters are allowed in the slug,
   * but spaces are replaced with hyphens.
   */

  function generateSlug(
    value: string
  ) {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const trimmedName =
        name.trim();

      if (!trimmedName) {
        throw new Error(
          "نام دسته‌بندی را وارد کنید."
        );
      }

      const slug =
        generateSlug(trimmedName);

      if (!slug) {
        throw new Error(
          "Slug دسته‌بندی معتبر نیست."
        );
      }

      const response = await fetch(
        "/api/admin/categories",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: trimmedName,
            slug,
            description: "",
          }),
        }
      );

      const text =
        await response.text();

      let data: {
        success?: boolean;
        category?: Category;
        message?: string;
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
        response.status === 401
      ) {
        throw new Error(
          "دسترسی شما تأیید نشد."
        );
      }

      if (
        response.status === 403
      ) {
        throw new Error(
          "شما دسترسی ادمین ندارید."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "ساخت دسته‌بندی ناموفق بود."
        );
      }

      if (!data.category) {
        throw new Error(
          "دسته‌بندی ساخته شد ولی اطلاعات آن دریافت نشد."
        );
      }

      onCreated(
        data.category
      );
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        dir="rtl"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
      >
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-black">
              دسته‌بندی جدید
            </h3>

            <p className="mt-1 text-xs text-neutral-400">
              فقط نام دسته‌بندی را وارد کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-black disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6"
        >
          <Input
            label="نام دسته‌بندی"
            value={name}
            onChange={setName}
            required
          />

          <p className="mt-2 text-[10px] leading-5 text-neutral-400">
            Slug به صورت خودکار از نام دسته‌بندی ساخته می‌شود.
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 flex-1 rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-200 disabled:opacity-50"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 flex-1 rounded-xl bg-black text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "در حال ساخت..."
                : "ساخت دسته‌بندی"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Generic input
|--------------------------------------------------------------------------
*/

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  required?: boolean;
  min?: number;
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
        min={min}
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
|--------------------------------------------------------------------------
| Price preview
|--------------------------------------------------------------------------
*/

function PricePreview({
  value,
}: {
  value: string;
}) {
  if (!value) {
    return null;
  }

  const number =
    getNumericPrice(value);

  if (!number) {
    return null;
  }

  return (
    <p className="mt-2 text-[10px] font-medium text-neutral-400">
      {formatToman(number)} تومان
    </p>
  );
}

/*
|--------------------------------------------------------------------------
| Discount preview
|--------------------------------------------------------------------------
*/

function DiscountPreview({
  price,
  offer,
}: {
  price: string;
  offer: string;
}) {
  if (!price || !offer) {
    return null;
  }

  const numericPrice =
    getNumericPrice(price);

  const numericOffer =
    Number(
      offer.replace(/,/g, "")
    );

  if (
    !numericPrice ||
    !Number.isFinite(
      numericOffer
    ) ||
    numericOffer < 0 ||
    numericOffer > 100
  ) {
    return null;
  }

  const finalPrice =
    calculateDiscountedPrice(
      numericPrice,
      numericOffer
    );

  return (
    <div className="mt-2">
      <p className="text-[10px] font-medium text-neutral-400">
        قیمت نهایی:
      </p>

      <p className="mt-0.5 text-[11px] font-bold text-black">
        {formatToman(
          finalPrice
        )}{" "}
        تومان
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Skeleton
|--------------------------------------------------------------------------
*/

function ProductsSkeleton() {
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