import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  getLowStock,
  getOutOfStock,
} from "@/app/lib/inventory/inventory.service";

export async function GET(
  request: NextRequest
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const { searchParams } =
      request.nextUrl;

    const thresholdParam =
      searchParams.get("threshold");

    const threshold =
      thresholdParam === null
        ? 5
        : Number(thresholdParam);

    if (
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid threshold",
        },
        {
          status: 400,
        }
      );
    }

    const [
      lowStock,
      outOfStock,
    ] = await Promise.all([
      getLowStock(threshold),
      getOutOfStock(),
    ]);

    return NextResponse.json({
      lowStock,
      outOfStock,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/inventory:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get inventory",
      },
      {
        status: 500,
      }
    );
  }
}