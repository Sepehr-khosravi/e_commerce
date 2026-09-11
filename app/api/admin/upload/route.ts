import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import sharp from "sharp";
import { requireAdmin } from "@/app/lib/auth/authorization";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 10;

const MAX_IMAGE_WIDTH = 10000;
const MAX_IMAGE_HEIGHT = 10000;

// جلوگیری از تصاویر با تعداد پیکسل غیرمنطقی
const MAX_IMAGE_PIXELS = 40_000_000;

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

const ALLOWED_IMAGE_FORMATS = new Set([
  "jpeg",
  "png",
  "webp",
]);

export async function POST(request: NextRequest) {
  try {
    // =====================================================
    // Authorization
    // =====================================================

    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    // =====================================================
    // Parse multipart/form-data
    // =====================================================

    const formData = await request.formData();

    const files = formData
      .getAll("files")
      .filter(
        (value): value is File => value instanceof File
      );

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

    // =====================================================
    // Persistent storage
    // =====================================================
    //
    // Container:
    //
    // /app/storage/products
    //
    // Docker bind mount:
    //
    // /var/www/app-data/ecommerce/storage/products
    //
    // =====================================================

    const uploadDir = path.join(
      process.cwd(),
      "storage",
      "products"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    const uploadedUrls: string[] = [];

    // =====================================================
    // Process files
    // =====================================================

    for (const file of files) {
      // ---------------------------------------------------
      // Basic filename validation
      // ---------------------------------------------------

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

      // ---------------------------------------------------
      // Empty file
      // ---------------------------------------------------

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

      // ---------------------------------------------------
      // File size limit
      // ---------------------------------------------------

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

      // ---------------------------------------------------
      // MIME validation
      // ---------------------------------------------------
      //
      // MIME alone is NOT trusted.
      // We validate the actual image with Sharp below.
      // ---------------------------------------------------

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

      // ---------------------------------------------------
      // Extension validation
      // ---------------------------------------------------

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

      // ===================================================
      // Read file
      // ===================================================

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ===================================================
      // Validate actual image
      // ===================================================

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

      // ---------------------------------------------------
      // Validate actual image format
      // ---------------------------------------------------

      if (
        !metadata.format ||
        !ALLOWED_IMAGE_FORMATS.has(metadata.format)
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

      // ---------------------------------------------------
      // Validate dimensions
      // ---------------------------------------------------

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

      // ---------------------------------------------------
      // Maximum dimensions
      // ---------------------------------------------------

      if (
        metadata.width > MAX_IMAGE_WIDTH ||
        metadata.height > MAX_IMAGE_HEIGHT
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

      // ---------------------------------------------------
      // Maximum pixel count
      // ---------------------------------------------------
      //
      // دفاع اضافه در برابر تصاویر بسیار بزرگ که می‌توانند
      // هنگام decode حافظه زیادی مصرف کنند.
      // ---------------------------------------------------

      const pixelCount =
        metadata.width * metadata.height;

      if (pixelCount > MAX_IMAGE_PIXELS) {
        return NextResponse.json(
          {
            error: `تعداد پیکسل‌های تصویر ${file.name} بیش از حد مجاز است.`,
          },
          {
            status: 400,
          }
        );
      }

      // ===================================================
      // Re-encode
      // ===================================================
      //
      // فایل کاربر مستقیماً ذخیره نمی‌شود.
      //
      // Sharp:
      //
      // input
      //   ↓
      // decode
      //   ↓
      // resize
      //   ↓
      // JPEG encode
      //   ↓
      // safe output
      //
      // بنابراین خروجی همیشه JPEG واقعی است.
      // ===================================================

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

      // ===================================================
      // Safe filename
      // ===================================================
      //
      // Never use the original user-controlled filename.
      // ===================================================

      const filename =
        `${Date.now()}-${crypto.randomUUID()}.jpg`;

      const filePath = path.join(
        uploadDir,
        filename
      );

      // ===================================================
      // Save
      // ===================================================

      await writeFile(
        filePath,
        optimizedBuffer
      );

      // ===================================================
      // Public URL
      // ===================================================

      uploadedUrls.push(
        `/api/uploads/products/${filename}`
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