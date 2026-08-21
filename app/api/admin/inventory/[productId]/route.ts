import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/app/lib/auth/authorization";

import {
  updateInventory,
} from "@/app/lib/inventory/inventory.service";

interface RouteContext {
  params: Promise<{
    productId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } =
      await requireAdmin();

    if (response) {
      return response;
    }

    const { productId } =
      await context.params;

    const id = Number(productId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const count = Number(body.count);

    if (
      !Number.isInteger(count) ||
      count < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid stock count",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await updateInventory(
        id,
        count
      );

    return NextResponse.json({
      product,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/inventory:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update inventory",
      },
      {
        status: 500,
      }
    );
  }
}