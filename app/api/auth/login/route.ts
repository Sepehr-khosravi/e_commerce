import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createOtp } from "@/app/lib/auth/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        {
          error: "Phone number is required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.phoneVerified) {
      return NextResponse.json(
        {
          error: "Phone number is not verified",
        },
        { status: 403 }
      );
    }

    await createOtp(phoneNumber, "login");

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
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