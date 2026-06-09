/**
 * POST /api/events/[slug]/expenses
 * Add an expense to an event
 */

import { NextRequest, NextResponse } from "next/server";
import {
  addExpense,
  getEventBySlug,
  getParticipantById,
} from "@/lib/db-operations";
import {
  successResponse,
  errorResponse,
  validateRequired,
  validatePositiveInteger,
  validateUUID,
  collectErrors,
} from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { payerId, amountCents, description } = body;

    // Validate input
    const errors = collectErrors([
      validateUUID(payerId, "payerId"),
      validatePositiveInteger(amountCents, "amountCents"),
    ]);
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

    // Verify payer exists in this event
    const payer = await getParticipantById(event.id, payerId);
    if (!payer) {
      return NextResponse.json(
        errorResponse("Participant not found in this event"),
        { status: 404 }
      );
    }

    // Add expense
    const expense = await addExpense(
      event.id,
      payerId,
      amountCents,
      description
    );

    return NextResponse.json(successResponse(expense), { status: 201 });
  } catch (error) {
    console.error("Error adding expense:", error);
    return NextResponse.json(
      errorResponse("Failed to add expense"),
      { status: 500 }
    );
  }
}
