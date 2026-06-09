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
