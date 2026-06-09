import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
}

// Initialize table clients
const eventsTable = new TableClient(connectionString, "events");
const participantsTable = new TableClient(connectionString, "participants");
const expensesTable = new TableClient(connectionString, "expenses");

// Ensure tables exist on startup
export async function initializeTables() {
  try {
    await eventsTable.createTable().catch(() => {
      // Table may already exist
    });
    await participantsTable.createTable().catch(() => {
      // Table may already exist
    });
    await expensesTable.createTable().catch(() => {
      // Table may already exist
    });
  } catch (error) {
    console.error("Error initializing tables:", error);
    throw error;
  }
}

export { eventsTable, participantsTable, expensesTable };
