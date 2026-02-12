"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { toast } from "sonner";

export function SocketListener() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    function onConnect() {
      console.log("Socket connected");
    }

    function onDisconnect() {
      console.log("Socket disconnected");
    }

    function onTicketUpdate(data: { id: string; type: string }) {
      console.log("Ticket update received:", data);

      // Invalidate list
      queryClient.invalidateQueries({ queryKey: ["tickets"] });

      // Invalidate specific ticket
      queryClient.invalidateQueries({ queryKey: ["ticket", data.id] });

      if (data.type === "processed") {
        toast.success("Ticket processed successfully", {
          action: {
            label: "View",
            onClick: () => {
              router.push(`/?ticketId=${data.id}`);
            },
          },
        });
      } else if (data.type === "failed") {
        toast.error("Ticket processing failed", {
          action: {
            label: "View",
            onClick: () => {
              router.push(`/?ticketId=${data.id}`);
            },
          },
        });
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("ticket:update", onTicketUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("ticket:update", onTicketUpdate);
    };
  }, [queryClient, router]);

  return null;
}
