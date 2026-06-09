"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEvent } from "@/lib/client-api";
import { EventDTO } from "@/lib/types";
import { Button } from "@/components/Button";
import { ParticipantList } from "@/components/ParticipantList";
import { ExpenseList } from "@/components/ExpenseList";

export default function EventDashboard() {
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      try {
        const data = await getEvent(slug);
        setEvent(data);
      } catch (err) {
        setError("Event not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }
  if (!event) return null;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Event: {event.name}</h2>

      <ParticipantList participants={event.participants} />

      <div className="mb-6">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.push(`/events/${slug}/add-participant`)}
        >
          + Add Participant
        </Button>
      </div>

      <ExpenseList expenses={event.expenses} participants={event.participants} />

      <div className="mb-6">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.push(`/events/${slug}/add-expense`)}
        >
          + Add Expense
        </Button>
      </div>

      <div className="mb-6">
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push(`/events/${slug}/settlement`)}
        >
          View Settlement
        </Button>
      </div>
    </div>
  );
}
