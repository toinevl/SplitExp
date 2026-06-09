# Phase 1: Project Setup & Database Schema

**Status**: ✅ Complete  
**Created**: 2026-06-09  
**Tech Stack**: Next.js 15+ (App Router) | TypeScript (strict) | Azure Table Storage | Azurite (local dev)

---

## What Was Implemented

### 1. Next.js Project with Modern Setup

- **Next.js 15+** with App Router (not Pages Router)
- **TypeScript** in strict mode (all files type-safe)
- **Tailwind CSS 4** for responsive design
- **ESLint 9** for code quality
- **Import aliases** (`@/*`) for clean imports

### 2. Azure Tables Schema (Cloud-Native NoSQL)

Three tables designed for cloud efficiency:

- **`events`** — Event metadata (single partition)
- **`participants`** — People in each event (partitioned by event)
- **`expenses`** — Transactions (partitioned by event)

See `SCHEMA.md` for detailed design and query patterns.

### 3. Azure Storage Integration

- **Azure Data Tables SDK** installed and configured
- **Connection string** management via environment variables
- **Table initialization** on app startup
- **Type-safe entities** for all table operations

### 4. Local Development Setup

- **Azurite** (Azure Storage emulator) in Docker
- **docker-compose.yml** for one-command setup
- **Scripts** for table initialization and development

---

## Getting Started

### Prerequisites

- Node.js 18+ (check: `node --version`)
- Docker + Docker Compose (for local Azure Table Storage emulation)
- Git

### 1. Clone & Install

```bash
cd expense-splitter
npm install
```

### 2. Set Up Local Environment

Copy the example config:

```bash
cp .env.local.example .env.local
```

The default `.env.local` points to Azurite (local emulator).

### 3. Start Azurite (Azure Storage Emulator)

```bash
npm run docker:up
```

This starts a containerized Azure Storage instance on port 10002 (Table Storage).

Check it's running:

```bash
docker ps
# Should show 'mcr.microsoft.com/azure-storage/azurite:latest'
```

### 4. Initialize Tables

```bash
npm run db:init
```

This creates the three tables (`events`, `participants`, `expenses`) in Azurite.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
expense-splitter/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (/)
│   └── api/                     # API routes (Phase 2)
│
├── lib/
│   ├── azure.ts                 # Azure Tables client initialization
│   ├── types.ts                 # TypeScript interfaces & DTOs
│   └── api.ts                   # Frontend API helpers (Phase 3)
│
├── components/                  # React components (Phase 3)
├── public/                       # Static assets
├── scripts/
│   └── init-tables.js          # Table initialization script
├── SCHEMA.md                     # Azure Tables schema documentation
├── .env.local                    # Local environment (git-ignored)
├── .env.local.example           # Template for .env.local
├── docker-compose.yml            # Azurite configuration
├── tsconfig.json                 # TypeScript strict mode
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind CSS config
└── eslintrc.json                # ESLint rules
```

---

## Cloud-Native Design Principles Used

### 1. **NoSQL (Azure Tables) Instead of SQL**

✅ Serverless-friendly: Tables scale automatically  
✅ Pay-per-request: No provisioned capacity  
✅ Simpler schema: No complex migrations  

### 2. **Strict TypeScript**

✅ All entities are type-safe  
✅ IDE autocomplete for all APIs  
✅ Compile-time error checking  

### 3. **Environment-Agnostic Connection Strings**

✅ Same code works locally (Azurite) and in Azure  
✅ No hardcoded credentials  
✅ Connection string via `.env.local`  

### 4. **Docker for Local Development**

✅ Azurite emulates Azure Storage faithfully  
✅ No cloud costs during development  
✅ Easy onboarding for new developers  

### 5. **Cents-Based Currency**

✅ All amounts stored as integers (cents)  
✅ Avoids floating-point rounding errors  
✅ Critical for financial accuracy  

---

## Development Workflow

### Day-to-Day

```bash
# Start Azurite (if not already running)
npm run docker:up

# Start dev server
npm run dev

# In another terminal, run tests or linting
npm run lint
```

### Cleanup

```bash
# Stop Azurite
npm run docker:down

# Remove Docker volume (if you want to reset data)
docker-compose down -v
```

---

## Environment Variables

### Local Development (`.env.local`)

```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=...;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;
NODE_ENV=development
```

### Production (Azure)

Set `AZURE_STORAGE_CONNECTION_STRING` to your real Azure Storage connection string in Azure App Service environment variables.

---

## Common Tasks

### Reset Database (Delete All Tables)

```bash
docker-compose down -v
npm run docker:up
npm run db:init
```

### Check Azurite Logs

```bash
docker-compose logs azurite
```

### Connect to Azurite with Azure Storage Explorer

1. Open Azure Storage Explorer
2. Click "Emulator" → "10002 (Table Service)"
3. View tables and entities

---

## Verification Checklist

- [ ] `npm install` succeeds, no errors
- [ ] `.env.local` is created and points to Azurite
- [ ] `npm run docker:up` starts Azurite (check `docker ps`)
- [ ] `npm run db:init` initializes tables (no errors)
- [ ] `npm run dev` starts Next.js on port 3000
- [ ] Browser opens to [http://localhost:3000](http://localhost:3000)
- [ ] TypeScript passes: `npm run build` (no errors)
- [ ] ESLint passes: `npm run lint` (no errors)

---

## What's Next (Phase 2)

Phase 2 will implement the backend API endpoints:

- `POST /api/events` — Create event
- `GET /api/events/[slug]` — Get event details
- `POST /api/events/[slug]/participants` — Add participant
- `POST /api/events/[slug]/expenses` — Add expense
- `GET /api/events/[slug]/settlement` — Calculate settlements

See `../expense-splitter-plan.md` for full Phase 2 spec.

---

## Troubleshooting

### "AZURE_STORAGE_CONNECTION_STRING is not set"

Make sure `.env.local` exists and has the connection string. Copy from `.env.local.example` if missing.

### "Cannot connect to Azurite"

Check that Azurite is running: `docker ps` should show the container. If not, run `npm run docker:up`.

### TypeScript errors in types.ts

Make sure `@azure/data-tables` is installed: `npm list @azure/data-tables`. Reinstall if needed: `npm install @azure/data-tables`.

### Port 10002 already in use

Azurite uses port 10002 for Table Storage. If it's in use, either:
1. Stop the other service using it
2. Edit `docker-compose.yml` to use a different port (e.g., `10003:10002`)

---

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Azure Table Storage Docs](https://learn.microsoft.com/en-us/azure/storage/tables/)
- [Azure Data Tables SDK](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/tables/data-tables)
- [Azurite Emulator](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite)

---

**Phase 1 Status**: ✅ Ready for Phase 2  
**Handoff**: Ready for Phase 2 implementation (API endpoints)
