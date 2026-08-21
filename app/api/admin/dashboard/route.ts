import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  getDashboard,
} from "@/app/lib/dashboard/dashboard.service";

export async function GET(
  _request: NextRequest
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const dashboard =
      await getDashboard();

    return NextResponse.json(
      dashboard
    );
  } catch (error) {
    console.error(
      "GET /api/admin/dashboard:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard",
      },
      {
        status: 500,
      }
    );
  }
}