import { TableEntity } from "@azure/data-tables";

// Event entity
export interface EventEntity extends TableEntity {
  partitionKey: "event"; // All events in one partition for easy querying
  rowKey: string; // event_id
  name: string;
  urlSlug: string; // unique URL slug
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string;
}

// Participant entity
export interface ParticipantEntity extends TableEntity {
  partitionKey: string; // event_id
  rowKey: string; // participant_id
  name: string;
  createdAt: string;
}

// Expense entity
export interface ExpenseEntity extends TableEntity {
  partitionKey: string; // event_id
  rowKey: string; // expense_id
  payerId: string; // participant_id
  amountCents: number; // Always store in cents to avoid float rounding
  description?: string;
  createdAt: string;
}

// DTOs for API responses
export interface EventDTO {
  id: string;
  name: string;
  urlSlug: string;
  createdAt: string;
  participants: ParticipantDTO[];
  expenses: ExpenseDTO[];
}

export interface ParticipantDTO {
  id: string;
  name: string;
  eventId: string;
  createdAt: string;
}

export interface ExpenseDTO {
  id: string;
  eventId: string;
  payerId: string;
  amountCents: number;
  description?: string;
  createdAt: string;
}

export interface SettlementDTO {
  balances: Record<string, number>; // participant_id -> amount in cents
  transactions: TransactionDTO[];
}

export interface TransactionDTO {
  fromId: string;
  toId: string;
  amountCents: number;
}
