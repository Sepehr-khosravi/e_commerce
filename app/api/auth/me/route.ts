import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth/current-user";

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
    },
  });
}