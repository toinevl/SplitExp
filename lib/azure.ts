import { TableClient } from "@azure/data-tables";

let eventsTable: TableClient | null = null;
let participantsTable: TableClient | null = null;
let expensesTable: TableClient | null = null;

function getConnectionString(): string {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
  }
  return connectionString;
}

function initializeClients() {
  if (!eventsTable) {
    const connectionString = getConnectionString();
    eventsTable = new TableClient(connectionString, "events");
    participantsTable = new TableClient(connectionString, "participants");
    expensesTable = new TableClient(connectionString, "expenses");
  }
}

export function getEventsTable(): TableClient {
  initializeClients();
  return eventsTable!;
}

export function getParticipantsTable(): TableClient {
  initializeClients();
  return participantsTable!;
}

export function getExpensesTable(): TableClient {
  initializeClients();
  return expensesTable!;
}

// Ensure tables exist on startup
export async function initializeTables() {
  try {
    const events = getEventsTable();
    const participants = getParticipantsTable();
    const expenses = getExpensesTable();

    await events.createTable().catch(() => {
      // Table may already exist
    });
    await participants.createTable().catch(() => {
      // Table may already exist
    });
    await expenses.createTable().catch(() => {
      // Table may already exist
    });
  } catch (error) {
    console.error("Error initializing tables:", error);
    throw error;
  }
}
