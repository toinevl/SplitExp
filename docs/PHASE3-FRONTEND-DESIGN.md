# Phase 3: Frontend UI Design Specification

**Date**: 2026-06-09  
**Status**: Design Approved  
**Approach**: Multi-Page Flow (Approach B)  
**Target**: Mobile-first responsive design using Next.js 15 + Tailwind CSS 4

---

## Overview

Phase 3 implements the frontend UI for ExpenseSplitter. The app follows a **multi-page flow** where each page has one primary purpose. Users create events, manage participants and expenses, then view the settlement calculation showing who owes whom.

**Navigation Flow**:
```
Home (/) 
  → Create Event 
  → Event Dashboard (/events/[slug])
      → Add Participant (/events/[slug]/add-participant)
      → Add Expense (/events/[slug]/add-expense)
      → Settlement (/events/[slug]/settlement)
```

---

## Page Specifications

### Page 1: Home (`/`)

**Purpose**: Create a new event and receive a shareable URL slug.

**User Flow**:
1. User enters event name (e.g., "Berlin Trip")
2. Clicks "Create"
3. Redirects to Event Dashboard with auto-populated slug

**Layout** (Mobile-first):
- Centered form container
- Single text input: "Event name" with placeholder "e.g., Berlin Trip"
- Large primary button: "Create Event"
- Header: "ExpenseSplitter" or app logo

**Responsive Behavior**:
- Mobile (< 640px): Full-width form, single column
- Desktop (≥ 640px): Centered max-width container (400px)

**API Integration**:
- POST `/api/events`
- Input: `{ name: string }`
- Output: `{ id, urlSlug, ... }`
- On success: Navigate to `/events/[slug]`
- On error: Display error message (validation or server error)

**Components Needed**:
- `EventForm` — Form component with validation
- `Button` — Primary action button
- `Input` — Text input with label
- Error state display

---

### Page 2: Event Dashboard (`/events/[slug]`)

**Purpose**: Central management hub. Users view participants, expenses, and access secondary actions.

**User Flow**:
1. Page loads with current event data
2. User can:
   - Copy event link (share with others)
   - Add a new participant
   - View list of participants
   - View list of expenses
   - Add a new expense
   - View settlement breakdown

**Layout** (Mobile-first, vertically stacked):

```
┌─ Header ─────────────────────┐
│ Event: Berlin Trip           │
│ [Link] [Share]               │
├──────────────────────────────┤
│ Participants (3)             │
│ • Alice                      │
│ • Bob                        │
│ • Charlie                    │
│ [+ Add Participant]          │
├──────────────────────────────┤
│ Expenses (2)                 │
│ [Expense Card 1]             │
│   Alice paid $120            │
│   → Hotel                    │
│ [Expense Card 2]             │
│   Bob paid $60               │
│   → Dinner                   │
│ [+ Add Expense]              │
├──────────────────────────────┤
│ [View Settlement]            │
└──────────────────────────────┘
```

**Data Fetching**:
- GET `/api/events/[slug]` on page load
- Returns: `{ event, participants[], expenses[] }`
- Refetch after adding participant or expense

**Navigation**:
- "Add Participant" → `/events/[slug]/add-participant`
- "Add Expense" → `/events/[slug]/add-expense`
- "View Settlement" → `/events/[slug]/settlement`

**Error Handling**:
- 404: Event not found → redirect to home
- Network error: Show retry button

**Components Needed**:
- `EventDashboard` — Main page component
- `ParticipantList` — Display participants
- `ExpenseList` — Display expenses with payer info
- `ExpenseCard` — Individual expense display
- Buttons for navigation actions

**Responsive Behavior**:
- Mobile: Full-width, stacked sections
- Tablet/Desktop (≥ 768px): Optional two-column for participants and expenses side-by-side

---

### Page 3: Add Participant (`/events/[slug]/add-participant`)

**Purpose**: Quick form to add a person to the event.

**User Flow**:
1. User enters participant name/email
2. Clicks "Add"
3. Returns to Event Dashboard
4. New participant appears in list

**Layout** (Mobile-first):

```
┌─ Header ─────────────────────┐
│ [Back] Add Participant       │
├──────────────────────────────┤
│ Name or Email                │
│ ┌──────────────────────────┐ │
│ │ [text input]             │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ [Add]                    │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [Cancel]                 │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**API Integration**:
- POST `/api/events/[slug]/participants`
- Input: `{ name: string }`
- Output: `{ id, name, eventId }`
- On success: Return to dashboard (previous page)
- On error: Display error message

**Components Needed**:
- `AddParticipantForm` — Form with validation
- `Input` — Text input
- `Button` — Primary and secondary buttons
- Back navigation

**Validation**:
- Name required (non-empty string)
- Show error message if invalid

---

### Page 4: Add Expense (`/events/[slug]/add-expense`)

**Purpose**: Record an expense (who paid, how much, for what).

**User Flow**:
1. User selects who paid from dropdown
2. Enters amount in dollars (auto-converts to cents)
3. Optionally adds description
4. Clicks "Add Expense"
5. Returns to dashboard

**Layout** (Mobile-first):

```
┌─ Header ─────────────────────┐
│ [Back] Add Expense           │
├──────────────────────────────┤
│ Who paid?                    │
│ ┌──────────────────────────┐ │
│ │ [Dropdown: Select...]    │ │
│ └──────────────────────────┘ │
│                              │
│ Amount                       │
│ ┌──────────────────────────┐ │
│ │ $ 0.00                   │ │
│ └──────────────────────────┘ │
│                              │
│ Description (optional)       │
│ ┌──────────────────────────┐ │
│ │ e.g., "Dinner"           │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ [Add Expense]            │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [Cancel]                 │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**API Integration**:
- GET `/api/events/[slug]` to populate participant dropdown
- POST `/api/events/[slug]/expenses`
- Input: `{ payerId, amountCents: number, description?: string }`
- Note: Convert dollars to cents on submit (e.g., $10.00 → 1000)
- On success: Return to dashboard
- On error: Display error message

**Components Needed**:
- `AddExpenseForm` — Form with validation
- `Select` or `Dropdown` — Participant selector
- `Input` — Dollar amount input (format as $0.00)
- `Textarea` — Description field
- `Button` — Primary and secondary buttons

**Validation**:
- Payer required
- Amount must be > 0
- Show error messages for invalid input

**Format Handling**:
- Input: Display as "$0.00"
- Output: Convert to cents (multiply by 100)
- Example: User enters "$10.50" → Send `amountCents: 1050`

---

### Page 5: Settlement (`/events/[slug]/settlement`)

**Purpose**: Display final settlement—who owes whom and how much.

**User Flow**:
1. Page loads and fetches settlement calculation
2. User sees list of transactions (e.g., "Bob pays Alice $40")
3. User can copy all transactions to clipboard
4. User can return to dashboard

**Layout** (Mobile-first):

```
┌─ Header ─────────────────────┐
│ [Back] Settlement            │
│ Berlin Trip                  │
├──────────────────────────────┤
│ Transactions                 │
│                              │
│ ╔════════════════════════╗   │
│ ║ Bob pays Alice         ║   │
│ ║     $40.00             ║   │
│ ╚════════════════════════╝   │
│                              │
│ ╔════════════════════════╗   │
│ ║ Charlie pays Alice     ║   │
│ ║     $40.00             ║   │
│ ╚════════════════════════╝   │
│                              │
│ ┌──────────────────────────┐ │
│ │ [Copy All]               │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [Back to Dashboard]      │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**API Integration**:
- GET `/api/events/[slug]/settlement`
- Returns: `{ balances, transactions[], participantMap }`
- Format each transaction as: `"{FromName} pays {ToName} ${Amount}"`

**Copy Functionality**:
- Formats transactions as plain text
- Copies to clipboard (navigator.clipboard.writeText)
- Shows success message: "Copied to clipboard!"

**Components Needed**:
- `SettlementView` — Main page component
- `TransactionCard` — Individual transaction display (prominent styling)
- `Button` — Copy and back buttons

**Responsive Behavior**:
- Mobile: Full-width cards, one per line
- Desktop: Optional grid layout (2+ cards per row)

**Error Handling**:
- No participants: Show message "Add participants to calculate settlement"
- No expenses: Show message "Add expenses to calculate settlement"
- API error: Show retry button

---

## Component Hierarchy

```
app/
├── layout.tsx                          (Root layout, header)
├── page.tsx                            (Home: Create Event)
└── events/
    └── [slug]/
        ├── layout.tsx                  (Event-level layout)
        ├── page.tsx                    (Dashboard)
        ├── add-participant/
        │   └── page.tsx
        ├── add-expense/
        │   └── page.tsx
        └── settlement/
            └── page.tsx

components/
├── EventForm.tsx                       (Create event form)
├── AddParticipantForm.tsx              (Add participant form)
├── AddExpenseForm.tsx                  (Add expense form)
├── ParticipantList.tsx                 (Display participants)
├── ExpenseList.tsx                     (Display expenses)
├── ExpenseCard.tsx                     (Individual expense)
├── TransactionCard.tsx                 (Individual settlement transaction)
├── Button.tsx                          (Reusable button component)
├── Input.tsx                           (Reusable input component)
└── Select.tsx                          (Dropdown/select component)

lib/
├── client-api.ts                       (Fetch wrapper for API calls)
└── (existing db-operations, settlement, etc.)
```

---

## Styling & Responsive Design

**Framework**: Tailwind CSS 4 (already configured)

**Design System**:
- **Colors**: 
  - Primary: `bg-blue-600` (actions)
  - Secondary: `bg-gray-100` (borders, backgrounds)
  - Error: `text-red-600`
  - Success: `text-green-600`

- **Spacing**:
  - Mobile: `px-4` horizontal padding, `py-6` vertical
  - Desktop: `max-w-4xl mx-auto` for wider screens

- **Typography**:
  - Headings: `text-2xl font-bold` (mobile) → `text-3xl` (desktop)
  - Body: `text-base` (16px)
  - Labels: `text-sm text-gray-700`

- **Buttons**:
  - Primary: `bg-blue-600 text-white rounded-lg py-3 px-6 font-semibold`
  - Secondary: `bg-gray-200 text-gray-900 rounded-lg py-3 px-6`
  - Small: `py-2 px-4`

- **Cards**:
  - Expense cards: `bg-white border border-gray-200 rounded-lg p-4 mb-3`
  - Transaction cards: `bg-blue-50 border-l-4 border-blue-600 p-4 mb-3`

**Responsive Breakpoints**:
- Mobile (< 640px): Full-width, stacked layout
- Tablet (640px - 1024px): Adjusted padding, wider forms
- Desktop (≥ 1024px): Optional multi-column layouts

---

## State Management

**Approach**: React hooks (useState, useContext) — no external state library needed for MVP.

**Per-page state**:
- Home: Form input (event name)
- Dashboard: Loading state, event data, error state
- Add Participant: Form input (name)
- Add Expense: Form inputs (payer, amount, description)
- Settlement: Settlement data, copy feedback

**Data Fetching**:
- Use Next.js `fetch` with proper error handling
- Show loading spinner while fetching
- Display error messages on failure
- Refetch after mutations (add participant, add expense)

---

## Error Handling

| Error | User Experience |
|-------|-----------------|
| Event not found (404) | Redirect to home with message: "Event not found" |
| Network error | Show retry button, message: "Connection error, try again" |
| Validation error | Highlight invalid field, show inline error message |
| Server error (500) | Show message: "Something went wrong, try again later" |
| No participants | Settlement page: "Add participants to calculate" |
| No expenses | Settlement page: "Add expenses to calculate" |

---

## Testing Checklist

- [ ] Home page: Create event, redirect to dashboard
- [ ] Dashboard: Display participants and expenses correctly
- [ ] Add Participant: Form validation, success, return to dashboard
- [ ] Add Expense: Form validation, amount conversion to cents, success
- [ ] Settlement: Display transactions correctly, copy to clipboard works
- [ ] Navigation: Back buttons work, URL slugs correct
- [ ] Mobile responsiveness: Test on mobile device or emulator
- [ ] Error cases: 404, network error, validation error

---

## Performance Notes

- Minimal client-side JavaScript (Next.js optimizations)
- Client API wrapper handles fetch/error retry logic
- Forms use controlled components (React state)
- Images: None for MVP (text-based UI)
- Bundle size: Tailwind CSS pruning removes unused classes

---

## Scope & Out-of-Scope

**In Scope (Phase 3)**:
- ✅ All 5 pages with forms and display logic
- ✅ Mobile-first responsive design
- ✅ Form validation and error handling
- ✅ Integration with Phase 2 backend API
- ✅ Copy to clipboard functionality
- ✅ Basic loading states

**Out of Scope (Future Phases)**:
- ❌ User authentication/login
- ❌ Email sharing
- ❌ Dark mode
- ❌ Animations/transitions
- ❌ Accessibility (WCAG) deep dive
- ❌ Payment processing
- ❌ Edit/delete expense functionality

---

**Design Status**: ✅ Approved  
**Ready for**: Phase 3 implementation planning
