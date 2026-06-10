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
