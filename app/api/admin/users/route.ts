import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  getUsers,
} from "@/app/lib/users/user.service";

export async function GET(
  request: NextRequest
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const searchParams =
      request.nextUrl.searchParams;

    const query =
      searchParams.get("query") ??
      undefined;

    const page = Number(
      searchParams.get("page") ?? 1
    );

    const limit = Number(
      searchParams.get("limit") ?? 20
    );

    const result =
      await getUsers({
        query,
        page,
        limit,
      });

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "GET /api/admin/users:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get users",
      },
      {
        status: 500,
      }
    );
  }
}