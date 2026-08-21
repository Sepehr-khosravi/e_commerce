import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyOtp } from "@/app/lib/auth/otp";
import { createSession } from "@/app/lib/auth/session";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    
    const { phoneNumber, code,  purpose  } = body;

    if (!phoneNumber || !code ) {
      return NextResponse.json(
        {
          error: "Phone number and verification code are required",
        },
        {
          status: 400,
        }
      );
    }

    const otpResult = await verifyOtp(
      phoneNumber,
      code,
      purpose
    );

    if (!otpResult.success) {
      return NextResponse.json(
        {
          error: otpResult.reason,
        },
        {
          status: 401,
        }
      );
    }

    const user = await prisma.user.update({
      where: {
        phoneNumber,
      },
      data: {
        phoneVerified: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}