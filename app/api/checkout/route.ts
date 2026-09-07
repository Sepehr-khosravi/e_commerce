import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/app/lib/auth/current-user";

import {
  getUserCart,
} from "@/app/lib/cart/cart.service";

import {
  prisma,
} from "@/app/lib/prisma";

export async function GET() {
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

    const [
      profile,
      cart,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: user.id,
        },

        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          address: true,
        },
      }),

      getUserCart(user.id),
    ]);

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      user: {
        firstName:
          profile.firstName,

        lastName:
          profile.lastName,

        phone:
          profile.phoneNumber,

        address:
          profile.address ?? "",
      },

      cart,
    });
  } catch (error) {
    console.error(
      "GET /api/checkout:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load checkout",
      },
      {
        status: 500,
      }
    );
  }
}