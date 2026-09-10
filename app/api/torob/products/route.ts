import { NextRequest, NextResponse } from "next/server";

import {
  TorobAuthError,
  verifyTorobRequest,
} from "@/app/lib/torob/torob.auth";
import {
  torobRequestSchema,
} from "@/app/lib/torob/torob.validation";
import { TorobRepository } from "@/app/lib/torob/torob.repository";
import { TorobService } from "@/app/lib/torob/torob.service";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Torob JWT
    await verifyTorobRequest(request);

    // 2. Parse JSON body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON body",
        },
        {
          status: 400,
        },
      );
    }

    // 3. Validate request body
    const validation = torobRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    // 4. Service
    const repository = new TorobRepository();
    const service = new TorobService(repository);

    const result = await service.getProducts(validation.data);

    // 5. Response
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error) {
    // Authentication errors
    if (error instanceof TorobAuthError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    console.error("Torob Products API Error:", error);

    return NextResponse.json(
      {
        error: "Invalid request",
      },
      {
        status: 400,
      },
    );
  }
}