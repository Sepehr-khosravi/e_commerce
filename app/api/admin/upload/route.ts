import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import sharp from "sharp";
import { requireAdmin } from "@/app/lib/auth/authorization";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

export async function POST(request: NextRequest) {
  try {
    // فقط ادمین اجازه آپلود دارد
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    const formData = await request.formData();

    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        {
          error: "هیچ فایلی ارسال نشده است.",
        },
        {
          status: 400,
        }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          error: `حداکثر ${MAX_FILES} تصویر در هر آپلود مجاز است.`,
        },
        {
          status: 400,
        }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "storage",
      "products"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      /*
       * ----------------------------------------
       * Basic validation
       * ----------------------------------------
       */

      if (!file.name || file.name.length > 255) {
        return NextResponse.json(
          {
            error: "نام فایل نامعتبر است.",
          },
          {
            status: 400,
          }
        );
      }

      if (file.size <= 0) {
        return NextResponse.json(
          {
            error: `فایل ${file.name} خالی است.`,
          },
          {
            status: 400,
          }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `حجم ${file.name} بیشتر از 5MB است.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * MIME type را بررسی می‌کنیم،
       * ولی به آن اعتماد نمی‌کنیم.
       */

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error: `فرمت فایل ${file.name} مجاز نیست.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * پسوند هم فقط یک بررسی اولیه است.
       * امنیت اصلی پایین‌تر با Sharp انجام می‌شود.
       */

      const extension = path
        .extname(file.name)
        .toLowerCase();

      if (!ALLOWED_EXTENSIONS.has(extension)) {
        return NextResponse.json(
          {
            error: `پسوند فایل ${file.name} مجاز نیست.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * ----------------------------------------
       * Read file
       * ----------------------------------------
       */

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      /*
       * ----------------------------------------
       * واقعی بودن تصویر را بررسی می‌کنیم
       * ----------------------------------------
       *
       * اگر کسی مثلاً فایل مخرب را با نام
       * photo.jpg بفرستد، صرفاً اسم و MIME
       * باعث قبول شدنش نمی‌شود.
       *
       * Sharp باید بتواند محتوای فایل را
       * واقعاً به عنوان تصویر پردازش کند.
       */

      let metadata;

      try {
        metadata = await sharp(buffer).metadata();
      } catch {
        return NextResponse.json(
          {
            error: `فایل ${file.name} یک تصویر معتبر نیست.`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        !metadata.format ||
        !["jpeg", "png", "webp"].includes(
          metadata.format
        )
      ) {
        return NextResponse.json(
          {
            error: `فرمت واقعی فایل ${file.name} مجاز نیست.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * تصویر باید ابعاد معتبر داشته باشد.
       */

      if (
        !metadata.width ||
        !metadata.height ||
        metadata.width <= 0 ||
        metadata.height <= 0
      ) {
        return NextResponse.json(
          {
            error: `ابعاد تصویر ${file.name} معتبر نیست.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * جلوگیری از تصاویر بیش از حد بزرگ
       * از نظر ابعاد.
       */

      if (
        metadata.width > 10000 ||
        metadata.height > 10000
      ) {
        return NextResponse.json(
          {
            error: `ابعاد تصویر ${file.name} بیش از حد مجاز است.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * ----------------------------------------
       * Re-encode
       * ----------------------------------------
       *
       * فایل ورودی را مستقیماً ذخیره نمی‌کنیم.
       *
       * Sharp آن را decode می‌کند و دوباره
       * به JPEG تبدیل می‌کند.
       *
       * بنابراین فایل خروجی چیزی نیست که
       * کاربر مستقیماً آپلود کرده باشد.
       */

      let optimizedBuffer: Buffer;

      try {
        optimizedBuffer = await sharp(buffer)
          .rotate()
          .resize(1200, 1200, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 80,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();
      } catch (error) {
        console.error(
          "Sharp processing error:",
          error
        );

        return NextResponse.json(
          {
            error: `پردازش تصویر ${file.name} ناموفق بود.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * ----------------------------------------
       * Generate safe filename
       * ----------------------------------------
       *
       * از نام فایل کاربر استفاده نمی‌کنیم.
       * پسوند هم همیشه .jpg است چون خروجی
       * Sharp واقعاً JPEG است.
       */

      const randomId = crypto.randomUUID();

      const filename = `${Date.now()}-${randomId}.jpg`;

      const filePath = path.join(
        uploadDir,
        filename
      );

      /*
       * ----------------------------------------
       * Save
       * ----------------------------------------
       */

      await writeFile(
        filePath,
        optimizedBuffer
      );

      uploadedUrls.push(
        `api/uploads/products/${filename}`
      );
    }

    return NextResponse.json(
      {
        success: true,
        urls: uploadedUrls,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Error uploading:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "خطا در آپلود تصاویر.",
      },
      {
        status: 500,
      }
    );
  }
}