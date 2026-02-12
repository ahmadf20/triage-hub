import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "@/module/tickets/services/ticketService";
import { GetTicketByIdResponse } from "@/module/tickets/models/TicketsApi";

export function useTicket(id: string | null) {
  return useQuery<GetTicketByIdResponse>({
    queryKey: ["ticket", id],
    queryFn: () => getTicketById({ id: id ?? "" }),
    enabled: Boolean(id),
  });
}
