import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createOtp } from "@/app/lib/auth/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      phoneNumber,
      firstName,
      lastName,
    } = body;

    if (!phoneNumber || !firstName || !lastName) {
      return NextResponse.json(
        {
          error: "Phone number, first name and last name are required",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (existingUser?.phoneVerified) {
      return NextResponse.json(
        {
          error: "A user with this phone number already exists",
        },
        { status: 409 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const user = existingUser
      ? await prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            firstName,
            lastName,
            ipAddress,
          },
        })
      : await prisma.user.create({
          data: {
            phoneNumber,
            firstName,
            lastName,
            ipAddress,
          },
        });

    await createOtp(phoneNumber, "register");

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      userId: user.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}