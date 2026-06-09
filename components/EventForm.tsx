"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/client-api";
import { Button } from "./Button";
import { Input } from "./Input";

export function EventForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Event name is required");
      return;
    }

    setIsLoading(true);
    try {
      const event = await createEvent(name);
      router.push(`/events/${event.urlSlug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create event"
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>

      <Input
        label="Event Name"
        placeholder="e.g., Berlin Trip"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error || undefined}
      />

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        Create Event
      </Button>
    </form>
  );
}
