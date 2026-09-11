import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      filename: string;
    }>;
  }
) {
  try {
    const { filename } = await params;

    // =====================================================
    // Validate filename
    // =====================================================
    //
    // We only allow a plain filename.
    //
    // Rejected:
    //
    // ../secret
    // ../../etc/passwd
    // foo/bar.jpg
    // foo\bar.jpg
    //
    // =====================================================

    if (
      !filename ||
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..")
    ) {
      return new NextResponse(
        "Invalid filename",
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // Extra filename validation
    // =====================================================
    //
    // Uploaded files are always generated as:
    //
    // timestamp-UUID.jpg
    //
    // So there is no reason to accept arbitrary filenames.
    // =====================================================

    const safeFilenamePattern =
      /^\d+-[0-9a-fA-F-]+\.jpg$/;

    if (!safeFilenamePattern.test(filename)) {
      return new NextResponse(
        "Invalid filename",
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // Resolve storage path
    // =====================================================

    const filePath = path.join(
      process.cwd(),
      "storage",
      "products",
      filename
    );

    // =====================================================
    // Read file
    // =====================================================

    const file = await readFile(filePath);

    // =====================================================
    // Response
    // =====================================================

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",

        // Images have generated immutable filenames.
        "Cache-Control":
          "public, max-age=31536000, immutable",

        // Prevent MIME sniffing.
        "X-Content-Type-Options":
          "nosniff",

        // Don't allow the image response to be embedded
        // in unexpected browsing contexts.
        "Content-Disposition":
          "inline",
      },
    });
  } catch (error) {
    console.error(
      "Error serving product image:",
      error
    );

    return new NextResponse(
      "Image not found",
      {
        status: 404,
      }
    );
  }
}