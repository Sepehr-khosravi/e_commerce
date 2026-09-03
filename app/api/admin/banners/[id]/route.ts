import { requireAdmin } from "@/app/lib/auth/authorization";
import { NextRequest, NextResponse } from "next/server";
import { removeBanner } from "@/app/lib/banners/banner.service";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { response } = await requireAdmin();

        if (response) return response;

        const { id } = await params;
        const bannerId = Number(id);

        if (!Number.isInteger(bannerId) || bannerId <= 0) {
            return NextResponse.json(
                { error: "Invalid banner id" },
                { status: 400 }
            );
        }

        await removeBanner(bannerId);

        return NextResponse.json(
            {
                message: "Banner deleted successfully"
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/admin/banners/[id]:", error);

        return NextResponse.json(
            {
                error: "Failed to delete banner"
            },
            { status: 500 }
        );
    }
}