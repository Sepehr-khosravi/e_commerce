import { NextResponse } from "next/server";
import { findBanners } from "@/app/lib/banners/banner.service";

export async function GET() {
  try {
    const banners = await findBanners();

    return NextResponse.json(
      {
        banners,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/banners error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch banners",
      },
      { status: 500 }
    );
  }
}