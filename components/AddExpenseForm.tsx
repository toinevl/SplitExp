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
