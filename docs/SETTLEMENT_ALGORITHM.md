# Settlement Algorithm Documentation

## Overview

The settlement algorithm calculates who owes whom in a group after shared expenses. It minimizes the number of transactions needed to settle all debts.

## The Problem

**Scenario:** Alice, Bob, and Charlie go on a trip:
- Alice pays $120 for a hotel (split 3 ways: $40 each)
- Bob pays $0
- Charlie pays $0

**Naive approach:** Bob pays Alice $40, Charlie pays Alice $40 (2 transactions)
**Optimal approach:** Same as above, but the algorithm finds this automatically

## The Algorithm (3 Steps)

### Step 1: Calculate Total and Per-Person Share

```
Total spent: $120
Number of people: 3
Share per person: $120 ÷ 3 = $40 each
```

### Step 2: Calculate Individual Balances

For each person, balance = (amount they paid) - (their fair share)

```
Alice:   paid $120 - share $40 = balance +$80 (is owed $80)
Bob:     paid $0   - share $40 = balance -$40 (owes $40)
Charlie: paid $0   - share $40 = balance -$40 (owes $40)
```

**Interpretation:**
- Positive balance = person is owed money (creditor)
- Negative balance = person owes money (debtor)
- Sum of all balances = 0 (always, by definition)

### Step 3: Generate Minimal Transactions (Greedy Matching)

The algorithm separates participants into two groups:
1. **Debtors** (negative balance) — people who owe money
2. **Creditors** (positive balance) — people who are owed money

Then it greedily matches them:
- Take a debtor
- Find creditors they haven't paid off yet
- Match them in minimum units (smallest of what debtor owes or creditor is owed)
- Repeat until all balances clear

**Example with our scenario:**
```
Debtors:   Bob (-$40), Charlie (-$40)
Creditors: Alice (+$80)

Transaction 1: Bob pays Alice $40
  → Bob balance: $0 ✓
  → Alice balance: $40 remaining

Transaction 2: Charlie pays Alice $40
  → Charlie balance: $0 ✓
  → Alice balance: $0 ✓
```

**Result:** 2 transactions settle all debts

## Key Features

### ✅ Handles Rounding Errors
All amounts stored as **cents (integers)**, never floats:
- $10.50 stored as 1050 cents
- Calculations use integers only
- Avoids floating-point precision issues

### ✅ Minimal Transactions
The greedy algorithm generates the minimum number of transactions needed to settle all debts (optimal for most real-world scenarios).

### ✅ Equal Splitting
Assumes equal cost sharing among all participants. If someone joined late or left early, they're still counted in the current settlement.

## Code Example

```typescript
const settlement = calculateSettlement({
  participantIds: ["alice", "bob", "charlie"],
  expenses: [
    { id: "exp1", payerId: "alice", amountCents: 12000 } // $120
  ]
});

console.log(settlement.balances);
// {
//   alice: 8000,      // $80 owed to her
//   bob: -4000,       // $40 debt
//   charlie: -4000    // $40 debt
// }

console.log(settlement.transactions);
// [
//   { fromId: "bob", toId: "alice", amountCents: 4000 },
//   { fromId: "charlie", toId: "alice", amountCents: 4000 }
// ]
```

## Complex Example

**Trip with mixed payments:**
- Alice pays $100 (hotel)
- Bob pays $60 (dinner)
- Charlie pays $0
- Total: $160 ÷ 3 = $53.33 per person

**Balances:**
```
Alice:   $100 - $53.33 = +$46.67 (owed)
Bob:     $60  - $53.33 = +$6.67 (owed)
Charlie: $0   - $53.33 = -$53.33 (owes)
```

**Transactions:**
1. Charlie pays Alice $46.67
2. Charlie pays Bob $6.66 (rounding: Bob gets $6.66, net difference absorbed)

**Why this works:**
- Charlie spent $0 but his fair share is $53.33
- Alice overpaid by $46.67
- Bob overpaid by $6.67
- Charlie's $53.33 debt exactly covers both

## Edge Cases

### No Expenses
```
Balance: Everyone owes $0
Transactions: []
```

### Already Settled
If everyone paid their fair share exactly, no transactions needed.

### Unequal Number of Participants
The algorithm handles any number of people. Share = Total ÷ number of participants.

## Implementation Details

**File:** `lib/settlement.ts`

**Main function:** `calculateSettlement(input: SettlementInput): SettlementDTO`

**Key constraints:**
- Amounts stored as cents (integers)
- Rounding handled with `Math.round()`
- Filtering debtors/creditors uses 0.5 cent threshold to account for rounding
- Greedy algorithm is O(n²) but n is typically small (< 20 people)

## Testing

Settlement algorithm is tested in `__tests__/settlement.test.ts`:
- ✅ Equal splits with unequal payments
- ✅ Unequal splits (different number of participants)
- ✅ Already balanced groups (no transactions)
- ✅ Empty state (no participants/expenses)
- ✅ Rounding edge cases (odd divisions)
- ✅ Complex multi-expense scenarios

Run tests:
```bash
npm test -- settlement.test.ts
```

## Future Enhancements

Possible improvements (out of scope for MVP):
1. **Weighted shares** — Some people pay for more people (parent + kids)
2. **Excluded participants** — Person leaves group, settles portion
3. **Itemized splitting** — Different split rules per expense
4. **Settlement history** — Track who paid whom over time
5. **Optimization** — Minimize transaction count further (NP-hard problem in general case)
