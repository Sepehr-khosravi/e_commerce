import { NextResponse } from "next/server";

import { getCurrentUser } from "@/app/lib/auth/current-user";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      role: user.role,
      phoneVerified: user.phoneVerified,
    },
  });
}


export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "ابتدا وارد حساب کاربری شوید.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const firstName =
      typeof body.firstName === "string"
        ? body.firstName.trim()
        : "";

    const lastName =
      typeof body.lastName === "string"
        ? body.lastName.trim()
        : "";

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    if (!firstName || !lastName) {
      return NextResponse.json(
        {
          message: "نام و نام خانوادگی الزامی است.",
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName,
        lastName,
        address: address || null,
      },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        address: true,
        role: true,
        phoneVerified: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      {
        message: "خطایی هنگام بروزرسانی اطلاعات رخ داد.",
      },
      {
        status: 500,
      }
    );
  }
}