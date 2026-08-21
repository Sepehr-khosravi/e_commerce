import { NextResponse } from "next/server";
import { deleteSession } from "@/app/lib/auth/session";

export async function POST() {
  await deleteSession();

  return NextResponse.json({
    success: true,
  });
}