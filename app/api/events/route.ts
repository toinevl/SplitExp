/**
 * POST /api/events
 * Create a new event
 */

import { NextRequest, NextResponse } from "next/server";
import { createEvent } from "@/lib/db-operations";
import {
  successResponse,
  errorResponse,
  validateRequired,
  collectErrors,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validate input
    const errors = collectErrors([validateRequired(name, "name")]);
    if (errors.length > 0) {
      return NextResponse.json(errorResponse(errors.join(", ")), {
        status: 400,
      });
    }

    // Create event
    const event = await createEvent(name);

    return NextResponse.json(successResponse(event), { status: 201 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error creating event:", errorMsg, error);
    return NextResponse.json(
      errorResponse(`Failed to create event: ${errorMsg}`),
      { status: 500 }
    );
  }
}
