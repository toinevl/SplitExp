/**
 * GET /api/events/[slug]/settlement
 * Calculate settlement: who owes whom
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getEventBySlug,
} from "@/lib/db-operations";
import { calculateSettlement } from "@/lib/settlement";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Verify event exists
    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json(
        errorResponse("Event not found"),
        { status: 404 }
      );
    }

    if (event.participants.length === 0) {
      return NextResponse.json(
        errorResponse("No participants in this event"),
        { status: 400 }
      );
    }

    // Calculate settlement
    const settlement = calculateSettlement({
      participantIds: event.participants.map((p) => p.id),
      expenses: event.expenses.map((e) => ({
        id: e.id,
        payerId: e.payerId,
        amountCents: e.amountCents,
      })),
    });

    // Add participant names to response for convenience
    const participantMap: Record<string, string> = {};
    event.participants.forEach((p) => {
      participantMap[p.id] = p.name;
    });

    return NextResponse.json(
      successResponse({
        ...settlement,
        participantMap, // Map IDs to names for frontend
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error calculating settlement:", error);
    return NextResponse.json(
      errorResponse("Failed to calculate settlement"),
      { status: 500 }
    );
  }
}
