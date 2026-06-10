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
