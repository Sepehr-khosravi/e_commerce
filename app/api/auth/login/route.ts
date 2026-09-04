import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createOtp } from "@/app/lib/auth/otp";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                {
                    error: "Invalid request body",
                },
                {
                    status: 400,
                }
            );
        }

        const { phoneNumber } = body;

        if (
            typeof phoneNumber !== "string" ||
            !/^09\d{9}$/.test(phoneNumber)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Please enter your phone number using English digits only.",
                },
                {
                    status: 400,
                }
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
                {
                    status: 404,
                }
            );
        }

        if (!user.phoneVerified) {
            return NextResponse.json(
                {
                    error: "Phone number is not verified",
                },
                {
                    status: 403,
                }
            );
        }

        await createOtp(phoneNumber, "login");

        return NextResponse.json(
            {
                success: true,
                message: "Verification code sent",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    error: "Invalid JSON body",
                },
                {
                    status: 400,
                }
            );
        }

        console.error("POST /api/auth/login:", error);

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