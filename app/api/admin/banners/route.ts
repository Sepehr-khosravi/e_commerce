import { requireAdmin } from "@/app/lib/auth/authorization";
import { NextRequest, NextResponse } from "next/server";
import {
  createNewBanner,
  findBanners,
} from "@/app/lib/banners/banner.service";

export async function GET() {
  try {
    /*
    |--------------------------------------------------------------------------
    | Admin authentication
    |--------------------------------------------------------------------------
    */

    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    /*
    |--------------------------------------------------------------------------
    | Get banners
    |--------------------------------------------------------------------------
    */

    const banners = await findBanners();

    /*
    |--------------------------------------------------------------------------
    | Empty array is a valid response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        banners: Array.isArray(banners)
          ? banners
          : [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin/banners error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch banners",
      },
      {
        status: 500,
      }
    );
  }
};

export async function POST(request: NextRequest) {
  try {
    const { response } = await requireAdmin();

    if (response) return response;

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      typeof body.url !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const banner = await createNewBanner({
      url: body.url,
    });

    return NextResponse.json(
      {
        message: "Banner created successfully",
        banner,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/banners error:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid url!"
    ) {
      return NextResponse.json(
        {
          error: "Invalid banner image URL",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create banner",
      },
      { status: 500 }
    );
  }
};
