# Phase 3: Frontend UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first React frontend for SplitExp with 5 pages: event creation, dashboard, add participant, add expense, and settlement view. All pages connect to the Phase 2 REST API.

**Architecture:** Multi-page Next.js 15 app using the App Router. Each page is independent and fetches data from the backend API. Reusable component library (Button, Input, Select, Forms) reduces repetition. React hooks manage form state and API calls. Tailwind CSS handles responsive design.

**Tech Stack:** Next.js 15 (App Router), TypeScript, React hooks, Tailwind CSS 4, native fetch API

---

## File Structure

### New Files to Create

```
app/
├── layout.tsx (UPDATE - add header, global styles)
├── page.tsx (UPDATE - Home page)
└── events/
    ├── layout.tsx (NEW - Event layout with navigation)
    └── [slug]/
        ├── page.tsx (NEW - Event Dashboard)
        ├── add-participant/
        │   └── page.tsx (NEW)
        ├── add-expense/
        │   └── page.tsx (NEW)
        └── settlement/
            └── page.tsx (NEW)

components/
├── Button.tsx (NEW - Reusable button)
├── Input.tsx (NEW - Reusable text input)
├── Select.tsx (NEW - Dropdown/select)
├── EventForm.tsx (NEW - Home page form)
├── AddParticipantForm.tsx (NEW)
├── AddExpenseForm.tsx (NEW)
├── ParticipantList.tsx (NEW)
├── ExpenseList.tsx (NEW)
├── ExpenseCard.tsx (NEW)
├── TransactionCard.tsx (NEW)
└── SettlementView.tsx (NEW)

lib/
├── client-api.ts (NEW - Fetch wrapper for backend API)
└── (existing: db-operations.ts, settlement.ts, types.ts, api-utils.ts)

__tests__/
└── client-api.test.ts (NEW - API wrapper tests)
```

---

## Implementation Tasks

### Task 1: Set Up Root Layout and Styling

**Files:**
- Modify: `app/layout.tsx`

**Context:** The root layout needs a header with the app title and basic styling structure.

- [ ] **Step 1: Update root layout with header and global styles**

Open `app/layout.tsx` and replace the entire content:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExpenseSplitter",
  description: "Split expenses and settle debts with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <header className="bg-blue-600 text-white py-4 px-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold">ExpenseSplitter</h1>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify layout renders**

Start dev server: `npm run dev`

Open http://localhost:3000 in browser. Should see:
- Blue header with "ExpenseSplitter" title
- Main content area with gray background
- No console errors

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add root layout with header styling"
```

---

### Task 2: Create Client API Wrapper

**Files:**
- Create: `lib/client-api.ts`
- Create: `__tests__/client-api.test.ts`

**Context:** The API wrapper provides type-safe, reusable fetch calls to the backend. All pages use this instead of calling fetch directly.

- [ ] **Step 1: Write test for API wrapper**

Create `__tests__/client-api.test.ts`:

```typescript
import {
  createEvent,
  getEvent,
  addParticipant,
  addExpense,
  getSettlement,
} from "@/lib/client-api";

// Mock global fetch
global.fetch = jest.fn();

describe("Client API Wrapper", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create an event", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "123",
          name: "Test Event",
          urlSlug: "test-event-abc",
        },
      }),
    });

    const result = await createEvent("Test Event");
    expect(result.urlSlug).toBe("test-event-abc");
  });

  it("should handle API errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: "Validation failed",
      }),
    });

    try {
      await createEvent("");
      fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toContain("Validation failed");
    }
  });

  it("should fetch event by slug", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "123",
          name: "Test Event",
          participants: [],
          expenses: [],
        },
      }),
    });

    const result = await getEvent("test-event-abc");
    expect(result.name).toBe("Test Event");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- client-api.test.ts
```

Expected: FAIL — "client-api" module not found

- [ ] **Step 3: Write the API wrapper**

Create `lib/client-api.ts`:

```typescript
import { EventDTO, ParticipantDTO, ExpenseDTO, SettlementDTO } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    throw new Error(data.error || "API request failed");
  }

  return data.data!;
}

// Event operations
export async function createEvent(name: string): Promise<EventDTO> {
  return fetchApi<EventDTO>("/api/events", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getEvent(slug: string): Promise<EventDTO> {
  return fetchApi<EventDTO>(`/api/events/${slug}`);
}

// Participant operations
export async function addParticipant(
  slug: string,
  name: string
): Promise<ParticipantDTO> {
  return fetchApi<ParticipantDTO>(
    `/api/events/${slug}/participants`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  );
}

// Expense operations
export async function addExpense(
  slug: string,
  payerId: string,
  amountCents: number,
  description?: string
): Promise<ExpenseDTO> {
  return fetchApi<ExpenseDTO>(`/api/events/${slug}/expenses`, {
    method: "POST",
    body: JSON.stringify({ payerId, amountCents, description }),
  });
}

// Settlement operations
export async function getSettlement(
  slug: string
): Promise<
  SettlementDTO & { participantMap: Record<string, string> }
> {
  return fetchApi<SettlementDTO & { participantMap: Record<string, string> }>(
    `/api/events/${slug}/settlement`
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- client-api.test.ts
```

Expected: PASS — 3/3 tests passing

- [ ] **Step 5: Commit**

```bash
git add lib/client-api.ts __tests__/client-api.test.ts
git commit -m "feat: add client API wrapper with tests"
```

---

### Task 3: Create Reusable Button Component

**Files:**
- Create: `components/Button.tsx`

**Context:** Button is used across all pages. This component handles primary, secondary, and disabled states.

- [ ] **Step 1: Write the Button component**

Create `components/Button.tsx`:

```typescript
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClass =
    "rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300";

  const sizeClass =
    size === "sm"
      ? "py-2 px-4 text-sm"
      : size === "lg"
        ? "py-3 px-6 text-base"
        : "py-2 px-4 text-base";

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run build
```

Expected: No TypeScript errors for Button component

- [ ] **Step 3: Commit**

```bash
git add components/Button.tsx
git commit -m "feat: add reusable Button component"
```

---

### Task 4: Create Input Component

**Files:**
- Create: `components/Input.tsx`

**Context:** Reusable text input with label and error state support.

- [ ] **Step 1: Write the Input component**

Create `components/Input.tsx`:

```typescript
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg font-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? "border-red-500"
            : "border-gray-300 focus:border-blue-500"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run build
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add components/Input.tsx
git commit -m "feat: add reusable Input component"
```

---

### Task 5: Create Select Component

**Files:**
- Create: `components/Select.tsx`

**Context:** Dropdown/select for choosing participants.

- [ ] **Step 1: Write the Select component**

Create `components/Select.tsx`:

```typescript
import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? "border-red-500"
            : "border-gray-300 focus:border-blue-500"
        } ${className}`}
        {...props}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run build
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add components/Select.tsx
git commit -m "feat: add reusable Select component"
```

---

### Task 6: Home Page - Create Event Form

**Files:**
- Modify: `app/page.tsx`
- Create: `components/EventForm.tsx`

**Context:** Home page displays a form to create a new event. On submit, redirects to event dashboard.

- [ ] **Step 1: Write EventForm component**

Create `components/EventForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/client-api";
import { Button } from "./Button";
import { Input } from "./Input";

export function EventForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Event name is required");
      return;
    }

    setIsLoading(true);
    try {
      const event = await createEvent(name);
      router.push(`/events/${event.urlSlug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create event"
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>

      <Input
        label="Event Name"
        placeholder="e.g., Berlin Trip"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error || undefined}
      />

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        Create Event
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Update home page to use form**

Replace `app/page.tsx` content:

```typescript
import { EventForm } from "@/components/EventForm";

export default function Home() {
  return (
    <div className="py-12">
      <EventForm />
    </div>
  );
}
```

- [ ] **Step 3: Test in browser**

Start dev server: `npm run dev`
Open http://localhost:3000

- Enter "Test Event" in the form
- Click "Create Event"
- Should redirect to `/events/test-event-xxx` (with Azurite running in background)

If API error: Make sure Azurite is running (`npm run docker:up` and `npm run db:init`)

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/EventForm.tsx
git commit -m "feat: add home page with create event form"
```

---

### Task 7: Event Layout - Shared Navigation

**Files:**
- Create: `app/events/layout.tsx`

**Context:** Event-level layout adds navigation/back button for all event sub-pages.

- [ ] **Step 1: Write event layout**

Create `app/events/layout.tsx`:

```typescript
"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/Button";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back
        </button>
        {slug && (
          <button
            onClick={() => {
              const url = `${window.location.origin}/events/${slug}`;
              navigator.clipboard.writeText(url);
              alert("Link copied to clipboard!");
            }}
            className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Copy Link
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify layout compiles**

```bash
npm run build
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/events/layout.tsx
git commit -m "feat: add event layout with back button and link sharing"
```

---

### Task 8: Event Dashboard - Main Page

**Files:**
- Create: `app/events/[slug]/page.tsx`
- Create: `components/ParticipantList.tsx`
- Create: `components/ExpenseList.tsx`
- Create: `components/ExpenseCard.tsx`

**Context:** The dashboard is the central hub. It shows participants, expenses, and buttons to add more or view settlement.

- [ ] **Step 1: Write ParticipantList component**

Create `components/ParticipantList.tsx`:

```typescript
import { ParticipantDTO } from "@/lib/types";

interface ParticipantListProps {
  participants: ParticipantDTO[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">
        Participants ({participants.length})
      </h3>
      {participants.length === 0 ? (
        <p className="text-gray-600 text-sm">No participants yet</p>
      ) : (
        <ul className="space-y-2">
          {participants.map((p) => (
            <li
              key={p.id}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg"
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write ExpenseCard component**

Create `components/ExpenseCard.tsx`:

```typescript
import { ExpenseDTO, ParticipantDTO } from "@/lib/types";

interface ExpenseCardProps {
  expense: ExpenseDTO;
  participants: ParticipantDTO[];
}

export function ExpenseCard({ expense, participants }: ExpenseCardProps) {
  const payer = participants.find((p) => p.id === expense.payerId);
  const amount = (expense.amountCents / 100).toFixed(2);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <div className="font-semibold text-gray-900">
        {payer?.name} paid ${amount}
      </div>
      {expense.description && (
        <div className="text-sm text-gray-600 mt-1">→ {expense.description}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write ExpenseList component**

Create `components/ExpenseList.tsx`:

```typescript
import { ExpenseDTO, ParticipantDTO } from "@/lib/types";
import { ExpenseCard } from "./ExpenseCard";

interface ExpenseListProps {
  expenses: ExpenseDTO[];
  participants: ParticipantDTO[];
}

export function ExpenseList({
  expenses,
  participants,
}: ExpenseListProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">
        Expenses ({expenses.length})
      </h3>
      {expenses.length === 0 ? (
        <p className="text-gray-600 text-sm">No expenses yet</p>
      ) : (
        <div>
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              participants={participants}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write Dashboard page**

Create `app/events/[slug]/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEvent } from "@/lib/client-api";
import { EventDTO } from "@/lib/types";
import { Button } from "@/components/Button";
import { ParticipantList } from "@/components/ParticipantList";
import { ExpenseList } from "@/components/ExpenseList";

export default function EventDashboard() {
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      try {
        const data = await getEvent(slug);
        setEvent(data);
      } catch (err) {
        setError("Event not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }
  if (!event) return null;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Event: {event.name}</h2>

      <ParticipantList participants={event.participants} />

      <div className="mb-6">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.push(`/events/${slug}/add-participant`)}
        >
          + Add Participant
        </Button>
      </div>

      <ExpenseList expenses={event.expenses} participants={event.participants} />

      <div className="mb-6">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.push(`/events/${slug}/add-expense`)}
        >
          + Add Expense
        </Button>
      </div>

      <div className="mb-6">
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push(`/events/${slug}/settlement`)}
        >
          View Settlement
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Test in browser**

1. Go to http://localhost:3000
2. Create an event "Test Trip"
3. You should be on the event dashboard
4. Should see empty participants and expenses
5. Verify "Add Participant" and "Add Expense" buttons exist

- [ ] **Step 6: Commit**

```bash
git add app/events/[slug]/page.tsx components/ParticipantList.tsx components/ExpenseList.tsx components/ExpenseCard.tsx
git commit -m "feat: add event dashboard with participants and expenses display"
```

---

### Task 9: Add Participant Page

**Files:**
- Create: `app/events/[slug]/add-participant/page.tsx`
- Create: `components/AddParticipantForm.tsx`

**Context:** Simple form to add a person to the event.

- [ ] **Step 1: Write AddParticipantForm component**

Create `components/AddParticipantForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addParticipant } from "@/lib/client-api";
import { Button } from "./Button";
import { Input } from "./Input";

export function AddParticipantForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      await addParticipant(slug, name);
      router.push(`/events/${slug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add participant"
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add Participant</h2>

      <Input
        label="Name or Email"
        placeholder="e.g., Alice"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error || undefined}
      />

      <div className="space-y-3">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Add
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Write page component**

Create `app/events/[slug]/add-participant/page.tsx`:

```typescript
import { AddParticipantForm } from "@/components/AddParticipantForm";

export default function AddParticipantPage() {
  return <AddParticipantForm />;
}
```

- [ ] **Step 3: Test in browser**

1. Go to event dashboard
2. Click "Add Participant"
3. Enter a name and submit
4. Should redirect to dashboard with new participant in list

- [ ] **Step 4: Commit**

```bash
git add app/events/[slug]/add-participant/page.tsx components/AddParticipantForm.tsx
git commit -m "feat: add participant form and page"
```

---

### Task 10: Add Expense Page

**Files:**
- Create: `app/events/[slug]/add-expense/page.tsx`
- Create: `components/AddExpenseForm.tsx`

**Context:** Form to record who paid what. Dropdown for payer, number input for amount (converted to cents).

- [ ] **Step 1: Write AddExpenseForm component**

Create `components/AddExpenseForm.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEvent, addExpense } from "@/lib/client-api";
import { ParticipantDTO } from "@/lib/types";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";

export function AddExpenseForm() {
  const [participants, setParticipants] = useState<ParticipantDTO[]>([]);
  const [payerId, setPayerId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const event = await getEvent(slug);
        setParticipants(event.participants);
      } catch (err) {
        setError("Failed to load participants");
      } finally {
        setLoadingParticipants(false);
      }
    };

    if (slug) {
      fetchParticipants();
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!payerId) {
      setError("Please select who paid");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const amountCents = Math.round(parseFloat(amount) * 100);

    setIsLoading(true);
    try {
      await addExpense(slug, payerId, amountCents, description || undefined);
      router.push(`/events/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
      setIsLoading(false);
    }
  };

  if (loadingParticipants) {
    return <div className="text-center py-12">Loading participants...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add Expense</h2>

      <Select
        label="Who paid?"
        value={payerId}
        onChange={(e) => setPayerId(e.target.value)}
        options={participants.map((p) => ({
          value: p.id,
          label: p.name,
        }))}
        error={error && !payerId ? "Required" : undefined}
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={error && !amount ? "Required" : undefined}
      />

      <Input
        label="Description (optional)"
        placeholder="e.g., Dinner"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="space-y-3">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Add Expense
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Write page component**

Create `app/events/[slug]/add-expense/page.tsx`:

```typescript
import { AddExpenseForm } from "@/components/AddExpenseForm";

export default function AddExpensePage() {
  return <AddExpenseForm />;
}
```

- [ ] **Step 3: Test in browser**

1. Add 2 participants first (Alice, Bob)
2. Click "Add Expense"
3. Select "Alice" as payer
4. Enter "$50.00"
5. Add description "Dinner"
6. Submit
7. Should redirect to dashboard with new expense visible

- [ ] **Step 4: Commit**

```bash
git add app/events/[slug]/add-expense/page.tsx components/AddExpenseForm.tsx
git commit -m "feat: add expense form with amount conversion to cents"
```

---

### Task 11: Settlement View Page

**Files:**
- Create: `app/events/[slug]/settlement/page.tsx`
- Create: `components/TransactionCard.tsx`
- Create: `components/SettlementView.tsx`

**Context:** Display who owes whom. Format transactions clearly, add copy-to-clipboard.

- [ ] **Step 1: Write TransactionCard component**

Create `components/TransactionCard.tsx`:

```typescript
import { TransactionDTO } from "@/lib/types";

interface TransactionCardProps {
  transaction: TransactionDTO;
  fromName: string;
  toName: string;
}

export function TransactionCard({
  transaction,
  fromName,
  toName,
}: TransactionCardProps) {
  const amount = (transaction.amountCents / 100).toFixed(2);

  return (
    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-3 rounded">
      <div className="text-lg font-semibold text-gray-900">
        {fromName} pays {toName}
      </div>
      <div className="text-2xl font-bold text-blue-600 mt-2">${amount}</div>
    </div>
  );
}
```

- [ ] **Step 2: Write SettlementView component**

Create `components/SettlementView.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSettlement } from "@/lib/client-api";
import { SettlementDTO } from "@/lib/types";
import { Button } from "./Button";
import { TransactionCard } from "./TransactionCard";

export function SettlementView() {
  const [settlement, setSettlement] = useState<
    SettlementDTO & { participantMap: Record<string, string> }
  >();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    const fetchSettlement = async () => {
      try {
        const data = await getSettlement(slug);
        setSettlement(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settlement");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSettlement();
    }
  }, [slug]);

  const handleCopyAll = async () => {
    if (!settlement) return;

    const text = settlement.transactions
      .map((t) => {
        const amount = (t.amountCents / 100).toFixed(2);
        const fromName = settlement.participantMap[t.fromId];
        const toName = settlement.participantMap[t.toId];
        return `${fromName} pays ${toName} $${amount}`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Back</Button>
      </div>
    );
  if (!settlement) return null;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Settlement</h2>

      {settlement.transactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Everyone is settled up!</p>
          <Button onClick={() => router.back()}>Back to Dashboard</Button>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold mb-4">Transactions</h3>
          {settlement.transactions.map((transaction) => (
            <TransactionCard
              key={`${transaction.fromId}-${transaction.toId}`}
              transaction={transaction}
              fromName={settlement.participantMap[transaction.fromId]}
              toName={settlement.participantMap[transaction.toId]}
            />
          ))}

          <div className="space-y-3 mt-8">
            <Button
              className="w-full"
              variant={copied ? "secondary" : "primary"}
              onClick={handleCopyAll}
            >
              {copied ? "✓ Copied to Clipboard" : "Copy All"}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => router.back()}
            >
              Back to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write page component**

Create `app/events/[slug]/settlement/page.tsx`:

```typescript
import { SettlementView } from "@/components/SettlementView";

export default function SettlementPage() {
  return <SettlementView />;
}
```

- [ ] **Step 4: Test in browser**

1. Go back to event dashboard
2. Verify you have at least 2 participants and some expenses
3. Click "View Settlement"
4. Should see transactions in clear format
5. Click "Copy All" and verify it copies to clipboard
6. (Paste in a text area to verify)

- [ ] **Step 5: Commit**

```bash
git add app/events/[slug]/settlement/page.tsx components/TransactionCard.tsx components/SettlementView.tsx
git commit -m "feat: add settlement view with copy-to-clipboard"
```

---

### Task 12: Build and Verify All Pages

**Files:**
- Verify: All new files

**Context:** Final build check to ensure all pages compile and work end-to-end.

- [ ] **Step 1: Run TypeScript check**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Run linting**

```bash
npm run lint
```

Expected: No critical lint errors (warnings OK)

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: All tests pass (7/7 settlement + new API tests)

- [ ] **Step 4: Manual E2E test**

1. Start app: `npm run dev`
2. **Create event**: Go to http://localhost:3000, create "Team Dinner"
3. **Add participants**: Add 3 people (Alice, Bob, Charlie)
4. **Add expenses**:
   - Alice paid $120 (dinner)
   - Bob paid $30 (wine)
   - Charlie paid $0
5. **View settlement**: Click "View Settlement"
   - Should show: Bob → Alice $45, Charlie → Alice $45
6. **Copy transactions**: Click "Copy All", paste in notepad to verify
7. **Back button**: Verify back button works on all pages

- [ ] **Step 5: Test mobile responsiveness**

1. Open DevTools (F12)
2. Click mobile device simulator (iPhone SE)
3. Verify:
   - Text is readable (no horizontal scroll)
   - Buttons are touch-friendly (large)
   - Forms stack vertically
   - No layout broken on small screen

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: complete Phase 3 frontend implementation with all pages

All 5 frontend pages implemented:
- Home: Create event with form validation
- Dashboard: View participants, expenses, navigation
- Add Participant: Quick add form
- Add Expense: Amount conversion to cents, payer selection
- Settlement: Transaction display with copy functionality

Components:
- Reusable Button, Input, Select components
- Form components with error handling
- Display components (ParticipantList, ExpenseList, etc.)

Testing:
- Client API wrapper with tests
- TypeScript strict mode
- Mobile-first responsive design
- E2E flow tested manually

All pages compile, no TypeScript errors, responsive on mobile."