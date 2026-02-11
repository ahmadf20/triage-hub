export interface Ticket {
  id: string;
  content: string;
  customerEmail?: string;
  status: "PENDING" | "PROCESSED" | "RESOLVED" | "FAILED";
  category?: "BILLING" | "TECHNICAL" | "FEATURE_REQUEST";
  sentiment?: number;
  urgency?: "HIGH" | "MEDIUM" | "LOW";
  aiDraft?: string;
  createdAt: string;
  updatedAt: string;
}
