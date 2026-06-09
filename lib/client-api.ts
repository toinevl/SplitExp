import {
  EventDTO,
  ParticipantDTO,
  ExpenseDTO,
  SettlementDTO,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    throw new Error(data.error || "API request failed");
  }

  return data.data!;
}

// Event operations
export async function createEvent(name: string): Promise<EventDTO> {
  return fetchApi<EventDTO>("/api/events", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getEvent(slug: string): Promise<EventDTO> {
  return fetchApi<EventDTO>(`/api/events/${slug}`);
}

// Participant operations
export async function addParticipant(
  slug: string,
  name: string
): Promise<ParticipantDTO> {
  return fetchApi<ParticipantDTO>(
    `/api/events/${slug}/participants`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  );
}

// Expense operations
export async function addExpense(
  slug: string,
  payerId: string,
  amountCents: number,
  description?: string
): Promise<ExpenseDTO> {
  return fetchApi<ExpenseDTO>(`/api/events/${slug}/expenses`, {
    method: "POST",
    body: JSON.stringify({ payerId, amountCents, description }),
  });
}

// Settlement operations
export async function getSettlement(
  slug: string
): Promise<
  SettlementDTO & { participantMap: Record<string, string> }
> {
  return fetchApi<SettlementDTO & { participantMap: Record<string, string> }>(
    `/api/events/${slug}/settlement`
  );
}
