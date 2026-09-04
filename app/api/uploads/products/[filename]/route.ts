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

    // جلوگیری از Path Traversal
    if (
      !filename ||
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..")
    ) {
      return new NextResponse("Invalid filename", {
        status: 400,
      });
    }

    const filePath = path.join(
      process.cwd(),
      "storage",
      "products",
      filename
    );

    const file = await readFile(filePath);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control":
          "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);

    return new NextResponse("Image not found", {
      status: 404,
    });
  }
}