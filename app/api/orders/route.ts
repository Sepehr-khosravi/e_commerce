import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/app/lib/auth/current-user";

import {
  createNewOrder,
  getOrdersByUser,
} from "@/app/lib/orders/order.service";

export async function GET(
  request: NextRequest
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const searchParams =
      request.nextUrl.searchParams;

    const limitParam =
      searchParams.get("limit");

    const cursorParam =
      searchParams.get("cursor");

    const limit =
      limitParam
        ? Number(limitParam)
        : 20;

    const cursor =
      cursorParam
        ? Number(cursorParam)
        : undefined;

    if (
      !Number.isInteger(limit) ||
      limit <= 0 ||
      limit > 50
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid limit",
        },
        {
          status: 400,
        }
      );
    }

    if (
      cursor !== undefined &&
      (!Number.isInteger(cursor) ||
        cursor <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid cursor",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getOrdersByUser(
        user.id,
        limit,
        cursor
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "GET /api/orders:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get orders",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const result =
      await createNewOrder(
        user.id,
        {
          firstName:
            typeof body.firstName ===
            "string"
              ? body.firstName
              : "",

          lastName:
            typeof body.lastName ===
            "string"
              ? body.lastName
              : "",

          phone:
            typeof body.phone ===
            "string"
              ? body.phone
              : "",

          address:
            typeof body.address ===
            "string"
              ? body.address
              : "",
        }
      );

    return NextResponse.json(
      {
        success: true,
        order: result,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/orders:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to create order",
      },
      {
        status: 400,
      }
    );
  }
}