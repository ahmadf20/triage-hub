import { AxiosError } from "axios";
import {
  CreateTicketRequest,
  CreateTicketResponse,
  GetTicketsRequest,
  GetTicketsResponse,
  GetTicketByIdRequest,
  GetTicketByIdResponse,
  UpdateTicketRequest,
  UpdateTicketResponse,
} from "../models/TicketsApi";
import { httpService } from "@/lib/httpService";

export async function createTicket(
  req: CreateTicketRequest,
): Promise<CreateTicketResponse> {
  const { data } = await httpService.post<CreateTicketResponse>(
    "/tickets",
    req,
  );
  return data;
}

export async function getTickets(
  req: GetTicketsRequest,
): Promise<GetTicketsResponse> {
  const params: Record<string, string | number> = {
    page: req.page || 1,
    limit: req.limit || 10,
    sortBy: req.sortBy || "createdAt",
    sortOrder: req.sortOrder || "desc",
  };

  if (req.status && req.status !== "ALL") params.status = req.status;
  if (req.urgency && req.urgency !== "ALL") params.urgency = req.urgency;

  const { data } = await httpService.get<GetTicketsResponse>(`/tickets`, {
    params,
  });
  return data;
}

export async function getTicketById(
  req: GetTicketByIdRequest,
): Promise<GetTicketByIdResponse> {
  try {
    const { data } = await httpService.get<GetTicketByIdResponse>(
      `/tickets/${req.id}`,
    );
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new Error("Ticket not found");
    }

    throw new Error("Failed to fetch ticket");
  }
}

export async function updateTicket(
  id: string,
  req: UpdateTicketRequest,
): Promise<UpdateTicketResponse> {
  const { data } = await httpService.patch<UpdateTicketResponse>(
    `/tickets/${id}`,
    req,
  );
  return data;
}
