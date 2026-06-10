import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

let eventsTable: TableClient | null = null;
let participantsTable: TableClient | null = null;
let expensesTable: TableClient | null = null;

function getTableClients() {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
  }

  // Parse connection string to extract account name and key
  const parts = connStr.split(";").reduce((acc: Record<string, string>, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const accountName = parts["AccountName"];
  const accountKey = parts["AccountKey"];

  if (!accountName || !accountKey) {
    throw new Error("Invalid connection string: missing AccountName or AccountKey");
  }

  const url = `https://${accountName}.table.core.windows.net`;
  const credential = new AzureNamedKeyCredential(accountName, accountKey);

  return { url, credential };
}

function initializeClients() {
  if (!eventsTable) {
    const { url, credential } = getTableClients();
    eventsTable = new TableClient(url, "events", credential);
    participantsTable = new TableClient(url, "participants", credential);
    expensesTable = new TableClient(url, "expenses", credential);
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
