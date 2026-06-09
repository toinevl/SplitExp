/**
 * Database operations for Azure Table Storage
 * CRUD operations for events, participants, and expenses
 */

import { v4 as uuidv4 } from "uuid";
import {
  getEventsTable,
  getParticipantsTable,
  getExpensesTable,
} from "./azure";
import {
  EventEntity,
  ParticipantEntity,
  ExpenseEntity,
  EventDTO,
  ParticipantDTO,
  ExpenseDTO,
} from "./types";

// ============================================================================
// EVENTS
// ============================================================================

export async function createEvent(name: string): Promise<EventDTO> {
  const eventId = uuidv4();
  const urlSlug = generateUrlSlug(name);
  const now = new Date().toISOString();

  const event: EventEntity = {
    partitionKey: "event",
    rowKey: eventId,
    name,
    urlSlug,
    createdAt: now,
    updatedAt: now,
  };

  await getEventsTable().createEntity(event);

  return {
    id: eventId,
    name,
    urlSlug,
    createdAt: now,
    participants: [],
    expenses: [],
  };
}

export async function getEventBySlug(urlSlug: string): Promise<EventDTO | null> {
  try {
    // Query events table for matching slug
    const oDataFilter = `urlSlug eq '${escapeODataString(urlSlug)}'`;
    const events = getEventsTable().listEntities<EventEntity>({
      filter: oDataFilter,
    } as any); // Azure SDK typing quirk

    let event: EventEntity | null = null;
    for await (const e of events) {
      event = e;
      break;
    }

    if (!event) return null;

    // Get participants and expenses for this event
    const participants = await getParticipantsByEventId(event.rowKey);
    const expenses = await getExpensesByEventId(event.rowKey);

    return {
      id: event.rowKey,
      name: event.name,
      urlSlug: event.urlSlug,
      createdAt: event.createdAt,
      participants,
      expenses,
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export async function getEventById(eventId: string): Promise<EventDTO | null> {
  try {
    const event = await getEventsTable().getEntity<EventEntity>(
      "event",
      eventId
    );

    const participants = await getParticipantsByEventId(eventId);
    const expenses = await getExpensesByEventId(eventId);

    return {
      id: event.rowKey,
      name: event.name,
      urlSlug: event.urlSlug,
      createdAt: event.createdAt,
      participants,
      expenses,
    };
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return null;
  }
}

// ============================================================================
// PARTICIPANTS
// ============================================================================

export async function addParticipant(
  eventId: string,
  name: string
): Promise<ParticipantDTO> {
  const participantId = uuidv4();
  const now = new Date().toISOString();

  const participant: ParticipantEntity = {
    partitionKey: eventId,
    rowKey: participantId,
    name,
    createdAt: now,
  };

  await getParticipantsTable().createEntity(participant);

  return {
    id: participantId,
    name,
    eventId,
    createdAt: now,
  };
}

export async function getParticipantsByEventId(
  eventId: string
): Promise<ParticipantDTO[]> {
  try {
    const participants: ParticipantDTO[] = [];
    const query = getParticipantsTable().listEntities<ParticipantEntity>({
      filter: `PartitionKey eq '${escapeODataString(eventId)}'`,
    } as any);

    for await (const p of query) {
      participants.push({
        id: p.rowKey,
        name: p.name,
        eventId: p.partitionKey,
        createdAt: p.createdAt,
      });
    }

    return participants;
  } catch (error) {
    console.error("Error fetching participants:", error);
    return [];
  }
}

export async function getParticipantById(
  eventId: string,
  participantId: string
): Promise<ParticipantDTO | null> {
  try {
    const p = await getParticipantsTable().getEntity<ParticipantEntity>(
      eventId,
      participantId
    );

    return {
      id: p.rowKey,
      name: p.name,
      eventId: p.partitionKey,
      createdAt: p.createdAt,
    };
  } catch (error) {
    console.error("Error fetching participant:", error);
    return null;
  }
}

// ============================================================================
// EXPENSES
// ============================================================================

export async function addExpense(
  eventId: string,
  payerId: string,
  amountCents: number,
  description?: string
): Promise<ExpenseDTO> {
  const expenseId = uuidv4();
  const now = new Date().toISOString();

  const expense: ExpenseEntity = {
    partitionKey: eventId,
    rowKey: expenseId,
    payerId,
    amountCents,
    description,
    createdAt: now,
  };

  await getExpensesTable().createEntity(expense);

  return {
    id: expenseId,
    eventId,
    payerId,
    amountCents,
    description,
    createdAt: now,
  };
}

export async function getExpensesByEventId(eventId: string): Promise<ExpenseDTO[]> {
  try {
    const expenses: ExpenseDTO[] = [];
    const query = getExpensesTable().listEntities<ExpenseEntity>({
      filter: `PartitionKey eq '${escapeODataString(eventId)}'`,
    } as any);

    for await (const e of query) {
      expenses.push({
        id: e.rowKey,
        eventId: e.partitionKey,
        payerId: e.payerId,
        amountCents: e.amountCents,
        description: e.description,
        createdAt: e.createdAt,
      });
    }

    return expenses;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate a URL-safe slug from event name
 * Example: "Stockholm Summer Trip" -> "stockholm-summer-trip-abc123"
 */
function generateUrlSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30);

  const randomSuffix = uuidv4().substring(0, 6);
  return `${base}-${randomSuffix}`;
}

/**
 * Escape single quotes in OData filter strings
 */
function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}
