import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  editUser,
  getUserDetails,
} from "@/app/lib/users/user.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const { id } =
      await context.params;

    const userId = Number(id);

    const user =
      await getUserDetails(userId);

    return NextResponse.json({
      user,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get user",
      },
      {
        status: 404,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const { id } =
      await context.params;

    const userId = Number(id);

    const body =
      await request.json();

    const user =
      await editUser(
        userId,
        {
          firstName:
            typeof body.firstName ===
            "string"
              ? body.firstName
              : undefined,

          lastName:
            typeof body.lastName ===
            "string"
              ? body.lastName
              : undefined,

          phone:
            typeof body.phone ===
            "string"
              ? body.phone
              : undefined,

          address:
            body.address === null
              ? null
              : typeof body.address ===
                  "string"
                ? body.address
                : undefined,

          role:
            body.role === "ADMIN" ||
            body.role === "CUSTOMER"
              ? body.role
              : undefined,
        }
      );

    return NextResponse.json({
      user,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update user",
      },
      {
        status: 400,
      }
    );
  }
}