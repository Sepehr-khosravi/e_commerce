import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/app/lib/auth/current-user";
import { checkout } from "@/app/lib/checkout/checkout.service";

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

    const {
      firstName,
      lastName,
      phone,
      address,
    } = body;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid checkout information",
        },
        {
          status: 400,
        }
      );
    }

    const order = await checkout(
      user.id,
      {
        firstName,
        lastName,
        phone,
        address,
      }
    );

    return NextResponse.json(
      {
        message:
          "Order created successfully",
        order,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/checkout:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Checkout failed";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}