import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyOtp } from "@/app/lib/auth/otp";
import { createSession } from "@/app/lib/auth/session";

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

        const {
            phoneNumber,
            code,
            purpose,
        } = body;

        /*
         * Phone number must contain English digits only.
         */
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

        /*
         * OTP must contain exactly 6 English digits.
         */
        if (
            typeof code !== "string" ||
            !/^\d{6}$/.test(code)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Please enter the verification code using English digits only.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Only these purposes are allowed.
         */
        if (
            purpose !== "login" &&
            purpose !== "register"
        ) {
            return NextResponse.json(
                {
                    error: "Invalid verification purpose",
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
                    error: "Invalid verification request",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * A register OTP cannot be used for
         * an already verified account.
         */
        if (
            purpose === "register" &&
            user.phoneVerified
        ) {
            return NextResponse.json(
                {
                    error:
                        "Phone number is already verified",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * A login OTP can only be used by
         * an already verified account.
         */
        if (
            purpose === "login" &&
            !user.phoneVerified
        ) {
            return NextResponse.json(
                {
                    error:
                        "Phone number is not verified",
                },
                {
                    status: 403,
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

        const verifiedUser =
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    phoneVerified: true,
                },
            });

        await createSession(verifiedUser.id);

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: verifiedUser.id,
                    phoneNumber:
                        verifiedUser.phoneNumber,
                    firstName:
                        verifiedUser.firstName,
                    lastName:
                        verifiedUser.lastName,
                    role: verifiedUser.role,
                },
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

        console.error(
            "POST /api/auth/verify-otp:",
            error
        );

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