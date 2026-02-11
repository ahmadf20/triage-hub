import { Clock } from "lucide-react";
import {
  getStatusBadge,
  getUrgencyConfig,
  getSentimentIcon,
} from "./TicketUIHelpers";
import { Ticket } from "@/module/tickets/models/Ticket";

type TicketItemProps = {
  ticket: Ticket;
  isSelected: boolean;
  onClick: () => void;
};

export function TicketItem({ ticket, isSelected, onClick }: TicketItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer border-b border-gray-200 transition-colors ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500">
            #{ticket.id.slice(0, 8).toUpperCase()}
          </span>
          {getStatusBadge(ticket.status)}
        </div>
        <div
          className={`px-2 py-0.5 text-xs font-medium border rounded-full ${getUrgencyConfig(ticket.urgency).color}`}
        >
          {ticket.urgency || "PENDING"}
        </div>
      </div>
      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
        {ticket.content}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="flex items-center gap-1">
            {getSentimentIcon(ticket.sentiment)}
            <span className="text-xs">{ticket.sentiment ?? "—"}</span>
          </div>
          <span className="text-xs">{ticket.category?.replace(/_/g, " ")}</span>
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
