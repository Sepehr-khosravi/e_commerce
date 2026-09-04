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

        const {
            phoneNumber,
            firstName,
            lastName,
        } = body;

        /*
         * Only English digits are accepted.
         *
         * Valid:
         * 09331633485
         *
         * Invalid:
         * ۰۹۳۳۱۶۳۳۴۸۵
         * ٠٩٣٣١٦٣٣٤٨٥
         * +989331633485
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

        if (
            typeof firstName !== "string" ||
            !firstName.trim()
        ) {
            return NextResponse.json(
                {
                    error: "First name is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            typeof lastName !== "string" ||
            !lastName.trim()
        ) {
            return NextResponse.json(
                {
                    error: "Last name is required",
                },
                {
                    status: 400,
                }
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
                    error:
                        "A user with this phone number already exists",
                },
                {
                    status: 409,
                }
            );
        }

        /*
         * x-forwarded-for can contain multiple IPs:
         *
         * client, proxy1, proxy2
         *
         * We use the first one.
         */
        const forwardedFor =
            request.headers.get("x-forwarded-for");

        const ipAddress =
            forwardedFor?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown";

        const user = existingUser
            ? await prisma.user.update({
                  where: {
                      id: existingUser.id,
                  },
                  data: {
                      firstName: firstName.trim(),
                      lastName: lastName.trim(),
                      ipAddress,
                  },
              })
            : await prisma.user.create({
                  data: {
                      phoneNumber,
                      firstName: firstName.trim(),
                      lastName: lastName.trim(),
                      ipAddress,
                  },
              });

        await createOtp(phoneNumber, "register");

        return NextResponse.json(
            {
                success: true,
                message: "Verification code sent",
                userId: user.id,
            },
            {
                status: 201,
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

        console.error("POST /api/auth/register:", error);

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