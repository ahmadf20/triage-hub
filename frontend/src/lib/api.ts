import { Ticket } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function createTicket(content: string, customerEmail?: string) {
  const res = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, customerEmail }),
  });
  if (!res.ok) throw new Error("Failed to create ticket");
  return res.json();
}

export async function getTickets(
  status?: string,
  urgency?: string,
): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.append("status", status);
  if (urgency && urgency !== "ALL") params.append("urgency", urgency);

  const res = await fetch(`${API_URL}/tickets?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function updateTicket(id: string, data: Partial<Ticket>) {
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update ticket");
  return res.json();
}
