import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/module/tickets/services/ticketService";
import {
  GetTicketsRequest,
  GetTicketsResponse,
} from "@/module/tickets/models/TicketsApi";

export function useTickets(req: GetTicketsRequest) {
  return useQuery<GetTicketsResponse>({
    queryKey: ["tickets", req],
    queryFn: () => getTickets(req),
    refetchInterval: 5000,
  });
}
