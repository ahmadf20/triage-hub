import { Ticket } from "./Ticket";

// -- GET /tickets --
export type GetTicketsRequest = {
  status?: string;
  urgency?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type GetTicketsResponse = {
  tickets: Ticket[];
  total: number;
  pages: number;
  currentPage: number;
};

// -- GET /tickets/:id --
export type GetTicketByIdRequest = {
  id: string;
};

export type GetTicketByIdResponse = Ticket;

// -- POST /tickets --
export type CreateTicketRequest = {
  content: string;
  customerEmail?: string;
};

export type CreateTicketResponse = Ticket;

// -- PATCH /tickets/:id --
export type UpdateTicketRequest = {
  status?: Ticket["status"];
  aiDraft?: string;
};

export type UpdateTicketResponse = Ticket;
