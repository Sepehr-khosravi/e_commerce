import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/auth/authorization";

import {
    removeCategory,
    editCategory,
} from "@/app/lib/categories/category.service";

export async function PATCH(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    try {
        const { response } = await requireAdmin();

        if (response) {
            return response;
        }

        const { id: idParam } = await params;

        const id = Number(idParam);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    error: "Invalid category id.",
                },
                {
                    status: 400,
                }
            );
        }

        const body = await request.json();

        if (
            !body ||
            typeof body !== "object" ||
            typeof body.name !== "string"
        ) {
            return NextResponse.json(
                {
                    error: "Invalid request body.",
                },
                {
                    status: 400,
                }
            );
        }

        const name = body.name.trim();

        if (!name) {
            return NextResponse.json(
                {
                    error: "Category name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const category = await editCategory(id, {
            name,
        });

        return NextResponse.json(
            {
                message: "دسته بندی با موفقیت ویرایش شد.",
                category,
            },
            {
                status: 200,
            }
        );
    } catch (e) {
        console.error(
            "PATCH /api/admin/categories/[id] error:",
            e
        );

        return NextResponse.json(
            {
                error:
                    e instanceof Error
                        ? e.message
                        : "Internal server error.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    try {
        const { response } = await requireAdmin();

        if (response) {
            return response;
        }

        const { id: idParam } = await params;

        const id = Number(idParam);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    error: "Invalid category id.",
                },
                {
                    status: 400,
                }
            );
        }

        await removeCategory(id);

        return NextResponse.json(
            {
                message: "دسته بندی با موفقیت پاک شد.",
            },
            {
                status: 200,
            }
        );
    } catch (e) {
        if (
            e instanceof Error &&
            e.message ===
                "Cannot delete a category that contains products"
        ) {
            return NextResponse.json(
                {
                    error:
                        "قادر به حذف این دسته بندی نیست، چون این دسته بندی هنوز دارای محصول است.",
                },
                {
                    status: 409,
                }
            );
        }

        console.error(
            "DELETE /api/admin/categories/[id] error:",
            e
        );

        return NextResponse.json(
            {
                error: "Internal server error.",
            },
            {
                status: 500,
            }
        );
    }
}