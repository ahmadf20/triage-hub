import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTicket } from "@/module/tickets/services/ticketService";

import { UpdateTicketRequest } from "../models/TicketsApi";

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTicketRequest & { id: string }) => {
      return updateTicket(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket"] });
    },
  });
}
