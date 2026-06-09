/**
 * POST /api/events/[slug]/participants
 * Add a participant to an event
 */

import { NextRequest, NextResponse } from "next/server";
import {
  addParticipant,
  getEventBySlug,
} from "@/lib/db-operations";
import {
  successResponse,
  errorResponse,
  validateRequired,
  collectErrors,
} from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name } = body;

    // Validate input
    const errors = collectErrors([validateRequired(name, "name")]);
    if (errors.length > 0) {
      return NextResponse.json(errorResponse(errors.join(", ")), {
        status: 400,
      });
    }

    // Verify event exists
    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json(
        errorResponse("Event not found"),
        { status: 404 }
      );
    }

    // Add participant
    const participant = await addParticipant(event.id, name);

    return NextResponse.json(successResponse(participant), { status: 201 });
  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json(
      errorResponse("Failed to add participant"),
      { status: 500 }
    );
  }
}
