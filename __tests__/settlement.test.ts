/**
 * Tests for settlement calculation algorithm
 */

import { calculateSettlement } from "@/lib/settlement";

describe("Settlement Calculation", () => {
  describe("Equal split - 3 people", () => {
    it("should calculate who owes when one person pays for all", () => {
      const result = calculateSettlement({
        participantIds: ["alice", "bob", "charlie"],
        expenses: [
          { id: "exp1", payerId: "alice", amountCents: 12000 }, // Alice paid $120
        ],
      });

      // Total: $120, split 3 ways = $40 each
      // Alice paid $120, owes $40 -> is owed $80
      // Bob paid $0, owes $40 -> owes $40
      // Charlie paid $0, owes $40 -> owes $40
      expect(result.balances.alice).toBe(8000); // +$80
      expect(result.balances.bob).toBe(-4000); // -$40
      expect(result.balances.charlie).toBe(-4000); // -$40

      // Transactions: Bob -> Alice $40, Charlie -> Alice $40
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions).toContainEqual({
        fromId: "bob",
        toId: "alice",
        amountCents: 4000,
      });
      expect(result.transactions).toContainEqual({
        fromId: "charlie",
        toId: "alice",
        amountCents: 4000,
      });
    });

    it("should calculate unequal split", () => {
      const result = calculateSettlement({
        participantIds: ["alice", "bob", "charlie"],
        expenses: [
          { id: "exp1", payerId: "alice", amountCents: 12000 }, // Alice paid $120
          { id: "exp2", payerId: "bob", amountCents: 6000 }, // Bob paid $60
        ],
      });

      // Total: $180, split 3 ways = $60 each
      // Alice: paid $120 - $60 = +$60 (is owed)
      // Bob: paid $60 - $60 = $0 (even)
      // Charlie: paid $0 - $60 = -$60 (owes)
      expect(result.balances.alice).toBe(6000); // +$60
      expect(result.balances.bob).toBe(0); // even
      expect(result.balances.charlie).toBe(-6000); // -$60

      // Transaction: Charlie -> Alice $60
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0]).toEqual({
        fromId: "charlie",
        toId: "alice",
        amountCents: 6000,
      });
    });

    it("should handle already balanced group", () => {
      const result = calculateSettlement({
        participantIds: ["alice", "bob", "charlie"],
        expenses: [
          { id: "exp1", payerId: "alice", amountCents: 5000 },
          { id: "exp2", payerId: "bob", amountCents: 5000 },
          { id: "exp3", payerId: "charlie", amountCents: 5000 },
        ],
      });

      // Total: $150, split 3 ways = $50 each
      // All paid $50 and owe $50 -> all even
      expect(result.balances.alice).toBe(0);
      expect(result.balances.bob).toBe(0);
      expect(result.balances.charlie).toBe(0);

      // No transactions needed
      expect(result.transactions).toHaveLength(0);
    });
  });

  describe("Empty state", () => {
    it("should handle no participants", () => {
      const result = calculateSettlement({
        participantIds: [],
        expenses: [],
      });

      expect(result.balances).toEqual({});
      expect(result.transactions).toEqual([]);
    });

    it("should handle participants with no expenses", () => {
      const result = calculateSettlement({
        participantIds: ["alice", "bob"],
        expenses: [],
      });

      expect(result.balances.alice).toBe(0);
      expect(result.balances.bob).toBe(0);
      expect(result.transactions).toEqual([]);
    });
  });

  describe("Rounding edge cases", () => {
    it("should handle odd split amounts (rounding cents)", () => {
      // $100 split among 3 people = $33.33 each
      const result = calculateSettlement({
        participantIds: ["alice", "bob", "charlie"],
        expenses: [
          { id: "exp1", payerId: "alice", amountCents: 10000 },
        ],
      });

      // Total should balance to zero or be very close (within 3 cents due to rounding)
      const total = Object.values(result.balances).reduce((a, b) => a + b, 0);
      expect(Math.abs(total)).toBeLessThanOrEqual(3); // Allow 3 cents rounding error
    });
  });

  describe("Multiple expenses", () => {
    it("should handle complex multi-expense scenario", () => {
      const result = calculateSettlement({
        participantIds: ["alice", "bob", "charlie"],
        expenses: [
          { id: "exp1", payerId: "alice", amountCents: 6000 }, // Hotel
          { id: "exp2", payerId: "bob", amountCents: 3000 }, // Food
          { id: "exp3", payerId: "charlie", amountCents: 3000 }, // Transport
        ],
      });

      // Total: $120, split 3 ways = $40 each
      // Alice: paid $60 - $40 = +$20
      // Bob: paid $30 - $40 = -$10
      // Charlie: paid $30 - $40 = -$10
      expect(result.balances.alice).toBe(2000);
      expect(result.balances.bob).toBe(-1000);
      expect(result.balances.charlie).toBe(-1000);

      // Should generate minimal transactions
      expect(result.transactions.length).toBeGreaterThan(0);
      // Verify transactions balance: total out = total in
      const totalOut = result.transactions.reduce((sum, t) => sum + t.amountCents, 0);
      expect(totalOut).toBe(2000); // Should equal Alice's balance
    });
  });
});
