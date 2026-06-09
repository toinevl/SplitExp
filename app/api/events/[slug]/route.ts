/**
 * GET /api/events/[slug]
 * Fetch event details with participants and expenses
 */

import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/db-operations";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        errorResponse("Event slug is required"),
        { status: 400 }
      );
    }

    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json(
        errorResponse("Event not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(event), { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      errorResponse("Failed to fetch event"),
      { status: 500 }
    );
  }
}
