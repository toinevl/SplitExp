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
