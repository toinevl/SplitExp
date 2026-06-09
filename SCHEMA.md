# Azure Tables Schema for ExpenseSplitter

## Overview

This app uses Azure Table Storage (NoSQL) for persistence. Tables are organized by domain entity.

## Table: `events`

Stores event metadata.

| Column | Type | Purpose |
|--------|------|---------|
| `partitionKey` | string | Always `"event"` (single partition for all events) |
| `rowKey` | string | Unique event ID (UUID v4) |
| `name` | string | Event name (e.g., "Trip to Berlin") |
| `urlSlug` | string | URL-safe slug + random suffix (unique, indexed) |
| `createdAt` | string | ISO 8601 timestamp |
| `updatedAt` | string | ISO 8601 timestamp |

**Partition Strategy**: All events in one partition (`"event"`) for simplicity and easy listing.

**Example**:
```
PartitionKey: "event"
RowKey: "550e8400-e29b-41d4-a716-446655440000"
name: "Stockholm Summer Trip"
urlSlug: "stockholm-summer-trip-abc123"
createdAt: "2026-06-09T10:00:00Z"
updatedAt: "2026-06-09T10:00:00Z"
```

---

## Table: `participants`

Stores participants (people in an event).

| Column | Type | Purpose |
|--------|------|---------|
| `partitionKey` | string | Event ID (event_id) |
| `rowKey` | string | Unique participant ID (UUID v4) |
| `name` | string | Participant name or email |
| `createdAt` | string | ISO 8601 timestamp |

**Partition Strategy**: Partition by event ID so all participants for an event are queried together efficiently.

**Example**:
```
PartitionKey: "550e8400-e29b-41d4-a716-446655440000"
RowKey: "660e8400-e29b-41d4-a716-446655440001"
name: "Alice"
createdAt: "2026-06-09T10:05:00Z"
```

---

## Table: `expenses`

Stores expenses (transactions within an event).

| Column | Type | Purpose |
|--------|------|---------|
| `partitionKey` | string | Event ID (event_id) |
| `rowKey` | string | Unique expense ID (UUID v4) |
| `payerId` | string | Participant ID of who paid |
| `amountCents` | number | Amount in cents (e.g., 1000 = $10.00) |
| `description` | string | What the expense was for (optional) |
| `createdAt` | string | ISO 8601 timestamp |

**Partition Strategy**: Partition by event ID so all expenses for an event are queried together.

**Why cents**: Avoid floating-point precision errors. Always store currency as integers.

**Example**:
```
PartitionKey: "550e8400-e29b-41d4-a716-446655440000"
RowKey: "770e8400-e29b-41d4-a716-446655440002"
payerId: "660e8400-e29b-41d4-a716-446655440001"
amountCents: 12000  // $120.00
description: "Hotel booking"
createdAt: "2026-06-09T10:10:00Z"
```

---

## Query Patterns

### List all events
```
Query: PartitionKey == "event"
Returns: All events
```

### Get all participants in an event
```
Query: PartitionKey == "{eventId}"
Table: participants
Returns: All participants for that event
```

### Get all expenses in an event
```
Query: PartitionKey == "{eventId}"
Table: expenses
Returns: All expenses for that event
```

---

## Indexing & Performance

Azure Table Storage automatically indexes:
- PartitionKey (hash)
- RowKey (range within partition)

For this schema:
- Events are fast (single partition, direct lookup by ID)
- Participants by event: fast (query by event PartitionKey)
- Expenses by event: fast (query by event PartitionKey)

No secondary indexes needed for this MVP.

---

## Data Consistency

- **Atomicity**: Individual entity operations are atomic (insert, update, delete)
- **Cross-entity consistency**: Not atomic. Example: if you add an expense and the participant doesn't exist, there's no transaction to roll back. **Client must validate**: expense.payerId exists in participants before inserting.
- **Timestamps**: Use `createdAt` (immutable) and `updatedAt` (mutable) for audit trails.

---

## Scaling Considerations

**Current design works well for**:
- < 10,000 events
- < 100,000 expenses

**If scaling beyond that**:
- Add secondary partition key (e.g., date range) for events
- Archive old events to separate table
- Consider Cosmos DB for global distribution

---

## Local Development (Azurite)

Use Docker to run Azure Table Storage locally:

```bash
docker-compose up -d

# Set environment variable:
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXeOUQi9Sj8L+2E=;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"
```

Tables are created automatically on app startup.
