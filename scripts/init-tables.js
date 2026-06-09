#!/usr/bin/env node

/**
 * Initialize Azure Tables for local development
 * Usage: npm run db:init
 */

const { TableClient } = require("@azure/data-tables");
require("dotenv").config({ path: ".env.local" });

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  console.error("❌ AZURE_STORAGE_CONNECTION_STRING not set in .env.local");
  process.exit(1);
}

const tableNames = ["events", "participants", "expenses"];

async function initTables() {
  console.log("🚀 Initializing Azure Tables...");

  for (const tableName of tableNames) {
    try {
      const client = new TableClient(connectionString, tableName);
      await client.createTable();
      console.log(`✅ Table '${tableName}' created or already exists`);
    } catch (error) {
      if (
        error.code === "TableAlreadyExists" ||
        error.message.includes("already exists")
      ) {
        console.log(`✅ Table '${tableName}' already exists`);
      } else {
        console.error(`❌ Error creating table '${tableName}':`, error.message);
        process.exit(1);
      }
    }
  }

  console.log("\n✨ Azure Tables initialized successfully!");
  console.log("\nTo start developing:");
  console.log("  npm run dev");
}

initTables();
