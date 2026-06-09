/**
 * Settlement calculation algorithm
 *
 * Given expenses paid by different people, calculate who owes whom
 * to settle the group debts with minimum transactions.
 */

import { SettlementDTO, TransactionDTO } from "./types";

export interface SettlementInput {
  participantIds: string[];
  expenses: Array<{
    id: string;
    payerId: string;
    amountCents: number;
  }>;
}

/**
 * Calculate settlement: who owes whom
 *
 * Algorithm:
 * 1. Calculate total and per-person equal share
 * 2. For each person: balance = amount_paid - their_share
 *    Negative balance = owes money, positive = is owed money
 * 3. Generate minimal transactions using greedy approach
 */
export function calculateSettlement(
  input: SettlementInput
): SettlementDTO {
  const { participantIds, expenses } = input;

  if (participantIds.length === 0) {
    return {
      balances: {},
      transactions: [],
    };
  }

  // Step 1: Calculate total and per-person share
  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const sharePerPerson = totalCents / participantIds.length;

  // Step 2: Calculate balance per person
  const balances: Record<string, number> = {};
  participantIds.forEach((id) => {
    balances[id] = 0;
  });

  // Add what each person paid
  expenses.forEach((e) => {
    balances[e.payerId] += e.amountCents;
  });

  // Subtract their share
  participantIds.forEach((id) => {
    balances[id] -= sharePerPerson;
  });

  // Round to nearest cent to avoid floating point errors
  Object.keys(balances).forEach((id) => {
    balances[id] = Math.round(balances[id]);
  });

  // Step 3: Generate minimal transactions (greedy approach)
  const transactions = generateTransactions(balances);

  return {
    balances,
    transactions,
  };
}

/**
 * Generate minimal list of transactions to settle all debts
 * Using greedy approach: match largest debtors with largest creditors
 */
function generateTransactions(
  balances: Record<string, number>
): TransactionDTO[] {
  const transactions: TransactionDTO[] = [];

  // Separate debtors (negative) and creditors (positive)
  const debtors = Object.entries(balances)
    .filter(([_, bal]) => bal < -0.5) // Account for rounding
    .map(([id, bal]) => ({ id, amount: Math.round(Math.abs(bal)) }));

  const creditors = Object.entries(balances)
    .filter(([_, bal]) => bal > 0.5) // Account for rounding
    .map(([id, bal]) => ({ id, amount: Math.round(bal) }));

  // Greedy matching: process debtors
  for (let d = 0; d < debtors.length; d++) {
    let debtor = debtors[d];

    for (let c = 0; c < creditors.length; c++) {
      let creditor = creditors[c];

      if (debtor.amount <= 0) break;
      if (creditor.amount <= 0) continue;

      // Payment is minimum of what debtor owes and creditor is owed
      const payment = Math.min(debtor.amount, creditor.amount);

      if (payment > 0) {
        transactions.push({
          fromId: debtor.id,
          toId: creditor.id,
          amountCents: payment,
        });

        debtor.amount -= payment;
        creditor.amount -= payment;
      }
    }
  }

  return transactions;
}

/**
 * Format balance for display
 * Example: 1000 cents -> "$10.00"
 */
export function formatCents(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format transaction for display
 * Example: "Alice pays Bob $10.00"
 */
export function formatTransaction(
  transaction: TransactionDTO,
  participantNames: Record<string, string>
): string {
  const fromName = participantNames[transaction.fromId] || "Unknown";
  const toName = participantNames[transaction.toId] || "Unknown";
  const amount = formatCents(transaction.amountCents);
  return `${fromName} pays ${toName} ${amount}`;
}
