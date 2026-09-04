"use client";

import { useEffect, useState } from "react";
import {
  ImagePlus,
  Images,
  Plus,
  Trash2,
  X,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Banner = {
  id: number;
  url: string;
};

type BannersResponse = {
  banners?: Banner[];
  error?: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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
| Main Page
|--------------------------------------------------------------------------
*/

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load banners
  |--------------------------------------------------------------------------
  */

  async function loadBanners() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/banners",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const text = await response.text();

      let data: BannersResponse = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "پاسخ سرور JSON معتبر نیست."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Authentication / Authorization
      |--------------------------------------------------------------------------
      */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "دسترسی به پنل ادمین ندارید."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Other errors
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          data.error ||
            "خطا در دریافت بنرها."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Empty banners is NOT an error
      |--------------------------------------------------------------------------
      */

      setBanners(
        Array.isArray(data.banners)
          ? data.banners
          : []
      );
    } catch (error) {
      console.error(
        "Load banners error:",
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

  useEffect(() => {
    loadBanners();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Delete banner
  |--------------------------------------------------------------------------
  */

  async function handleDelete(
    banner: Banner
  ) {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید این بنر را حذف کنید؟"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/banners/${banner.id}`,
        {
          method: "DELETE",
        }
      );

      const text = await response.text();

      let data: ApiErrorResponse = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "پاسخ سرور معتبر نیست."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Authentication
      |--------------------------------------------------------------------------
      */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "دسترسی به حذف بنر ندارید."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Other errors
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "حذف بنر ناموفق بود."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Remove from UI
      |--------------------------------------------------------------------------
      */

      setBanners((current) =>
        current.filter(
          (item) =>
            item.id !== banner.id
        )
      );
    } catch (error) {
      console.error(
        "Delete banner error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "خطایی هنگام حذف بنر رخ داد."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return <BannersSkeleton />;
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 p-5 sm:p-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
            <Images
              size={34}
              className="mx-auto text-neutral-300"
            />

            <h1 className="mt-4 text-lg font-bold text-black">
              {error}
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              در دریافت اطلاعات بنرها مشکلی پیش آمده است.
            </p>

            <button
              type="button"
              onClick={loadBanners}
              className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
            >
              تلاش دوباره
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main Render
  |--------------------------------------------------------------------------
  */

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
              بنرها
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              مدیریت بنرهای فروشگاه
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
          >
            <Plus size={17} />

            افزودن بنر
          </button>
        </div>

        {/* Stats */}

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard
            title="همه بنرها"
            value={banners.length}
          />

          <StatCard
            title="بنرهای فعال"
            value={banners.length}
          />

          <StatCard
            title="تصاویر"
            value={banners.length}
          />
        </div>

        {/* Banners */}

        <div className="mt-8">

          {banners.length === 0 ? (
            <EmptyBanners
              onCreate={() =>
                setShowCreate(true)
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {banners.map((banner) => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Create Modal */}

      {showCreate && (
        <CreateBannerModal
          onClose={() =>
            setShowCreate(false)
          }
          onCreated={(banner) => {
            setBanners((current) => [
              banner,
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
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyBanners({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
        <Images className="h-8 w-8 text-neutral-400" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-neutral-900">
        هنوز هیچ بنری وجود ندارد
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
        در حال حاضر هیچ بنری برای نمایش وجود ندارد.
        برای شروع، اولین بنر خود را اضافه کنید.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />

        افزودن اولین بنر
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Stat Card
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
| Banner Card
|--------------------------------------------------------------------------
*/

function BannerCard({
  banner,
  onDelete,
}: {
  banner: Banner;
  onDelete: (
    banner: Banner
  ) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">

      {/* Image */} 

      <div className="relative aspect-[16/6] overflow-hidden bg-neutral-100">

      <img
        src={
          banner.url.startsWith("/")
            ? banner.url
            : `/${banner.url}`
        }
        alt={`بنر ${banner.id}`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
      />

        {/* ID */}

        <div className="absolute right-3 top-3 rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          #{banner.id}
        </div>

        {/* Delete */}

        <button
          type="button"
          onClick={() =>
            onDelete(banner)
          }
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-neutral-500 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
          title="حذف بنر"
        >
          <Trash2 size={15} />
        </button>

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between gap-3 p-4">

        <div className="min-w-0">
          {/* <p className="text-xs font-bold text-black">
            بنر شماره {banner.id}
          </p> */}

          <p
            dir="ltr"
            className="mt-1 truncate text-[10px] text-neutral-400"
          >
            {banner.url}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onDelete(banner)
          }
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition hover:bg-red-50 hover:text-red-500 sm:hidden"
          title="حذف بنر"
        >
          <Trash2 size={14} />
        </button>

      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Create Banner Modal
|--------------------------------------------------------------------------
*/

function CreateBannerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (
    banner: Banner
  ) => void;
}) {
  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Cleanup preview
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /*
  |--------------------------------------------------------------------------
  | Select image
  |--------------------------------------------------------------------------
  */

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    setError("");

    /*
    |--------------------------------------------------------------------------
    | Type
    |--------------------------------------------------------------------------
    */

    if (
      !ALLOWED_IMAGE_TYPES.has(
        selectedFile.type
      )
    ) {
      setError(
        "فرمت تصویر باید JPG، PNG یا WEBP باشد."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Size
    |--------------------------------------------------------------------------
    */

    if (
      selectedFile.size <= 0 ||
      selectedFile.size > MAX_IMAGE_SIZE
    ) {
      setError(
        "حجم تصویر باید حداکثر ۵MB باشد."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Signature
    |--------------------------------------------------------------------------
    */

    try {
      const valid =
        await hasValidImageSignature(
          selectedFile
        );

      if (!valid) {
        setError(
          "فایل انتخاب‌شده یک تصویر معتبر نیست."
        );

        return;
      }
    } catch {
      setError(
        "بررسی فایل تصویر ناموفق بود."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Replace old preview
    |--------------------------------------------------------------------------
    */

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);

    setPreview(
      URL.createObjectURL(
        selectedFile
      )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Remove selected image
  |--------------------------------------------------------------------------
  */

  function removeSelectedImage() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");
    setFile(null);
    setError("");
  }

  /*
  |--------------------------------------------------------------------------
  | Upload image
  |--------------------------------------------------------------------------
  */

  async function uploadImage(
    selectedFile: File
  ): Promise<string> {
    const formData =
      new FormData();

    formData.append(
      "files",
      selectedFile
    );

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

    /*
    |--------------------------------------------------------------------------
    | Auth
    |--------------------------------------------------------------------------
    */

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        "دسترسی به آپلود تصاویر ندارید."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Upload errors
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {
      throw new Error(
        data.error ||
          "آپلود تصویر ناموفق بود."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate response
    |--------------------------------------------------------------------------
    */

    if (
      data.success !== true ||
      !Array.isArray(data.urls) ||
      data.urls.length !== 1 ||
      typeof data.urls[0] !== "string"
    ) {
      throw new Error(
        "آدرس تصویر از سرور دریافت نشد."
      );
    }

    return data.urls[0];
  }

  /*
  |--------------------------------------------------------------------------
  | Create banner
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
      |--------------------------------------------------------------------------
      | Validate file
      |--------------------------------------------------------------------------
      */

      if (!file) {
        throw new Error(
          "لطفاً یک تصویر برای بنر انتخاب کنید."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Upload
      |--------------------------------------------------------------------------
      */

      const uploadedUrl =
        await uploadImage(file);

      /*
      |--------------------------------------------------------------------------
      | Create banner
      |--------------------------------------------------------------------------
      */

      const response = await fetch(
        "/api/admin/banners",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            url: uploadedUrl,
          }),
        }
      );

      const text =
        await response.text();

      let data: {
        banner?: Banner;
        error?: string;
        message?: string;
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

      /*
      |--------------------------------------------------------------------------
      | Auth
      |--------------------------------------------------------------------------
      */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "دسترسی به ساخت بنر ندارید."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Other errors
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "ساخت بنر ناموفق بود."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Validate created banner
      |--------------------------------------------------------------------------
      */

      if (
        !data.banner ||
        typeof data.banner.id !== "number" ||
        typeof data.banner.url !== "string"
      ) {
        throw new Error(
          "بنر ایجاد شد ولی اطلاعات آن دریافت نشد."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Done
      |--------------------------------------------------------------------------
      */

      onCreated(data.banner);
    } catch (error) {
      console.error(
        "Create banner error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "خطایی هنگام ایجاد بنر رخ داد."
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
    <div
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        dir="rtl"
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-black">
              افزودن بنر
            </h2>

            <p className="mt-1 text-xs text-neutral-400">
              تصویر بنر جدید را آپلود کنید.
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
          className="mt-7"
        >

          {/* Upload */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-neutral-600">
              تصویر بنر
            </label>

            {preview ? (
              <div className="relative overflow-hidden rounded-2xl bg-neutral-100">

                <div className="aspect-[16/6]">
                  <img
                    src={preview}
                    alt="پیش‌نمایش بنر"
                    className="h-full w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    removeSelectedImage
                  }
                  disabled={loading}
                  className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-black/70 text-white transition hover:bg-black disabled:opacity-50"
                  title="حذف تصویر انتخاب شده"
                >
                  <Trash2 size={15} />
                </button>

              </div>
            ) : (
              <label className="flex aspect-[16/6] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-black">

                <ImagePlus size={28} />

                <span className="mt-3 text-sm font-semibold">
                  انتخاب تصویر بنر
                </span>

                <span className="mt-1 text-[10px] text-neutral-400">
                  JPG, PNG, WEBP — حداکثر ۵MB
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleFileChange
                  }
                  disabled={loading}
                  className="hidden"
                />

              </label>
            )}
          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-xs font-semibold leading-6 text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}

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
              disabled={
                loading || !file
              }
              className="h-11 flex-1 rounded-xl bg-black text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "در حال آپلود..."
                : "افزودن بنر"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Skeleton
|--------------------------------------------------------------------------
*/

function BannersSkeleton() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50"
    >
      <div className="mx-auto max-w-7xl p-5 sm:p-8">

        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-28 animate-pulse rounded bg-neutral-200" />

            <div className="mt-3 h-9 w-32 animate-pulse rounded-xl bg-neutral-200" />

            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-neutral-200" />
          </div>

          <div className="h-11 w-32 animate-pulse rounded-xl bg-neutral-200" />
        </div>

        {/* Stats */}

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-neutral-200"
            />
          ))}
        </div>

        {/* Banners */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl bg-white"
            >
              <div className="aspect-[16/6] animate-pulse bg-neutral-200" />

              <div className="h-20 animate-pulse bg-neutral-100" />
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}