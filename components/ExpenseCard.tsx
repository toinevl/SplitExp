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
