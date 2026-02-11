import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTicket } from "@/module/tickets/services/ticketService";
import { CreateTicketRequest } from "../models/TicketsApi";

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreateTicketRequest) => createTicket(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
