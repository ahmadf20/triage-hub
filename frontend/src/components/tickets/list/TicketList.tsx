import { useTickets } from "@/module/tickets/hooks/useTickets";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Filter,
  AlertCircle,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TicketItem } from "./TicketItem";

type TicketListProps = {
  statusFilter: string;
  urgencyFilter: string;
  page: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  selectedTicketId: string | null;
  onTicketSelect: (ticketId: string) => void;
  onPageChange: (page: number) => void;
};

export function TicketList({
  statusFilter,
  urgencyFilter,
  page,
  sortBy,
  sortOrder,
  selectedTicketId,
  onTicketSelect,
  onPageChange,
}: TicketListProps) {
  const { data, isLoading, isError, refetch } = useTickets({
    status: statusFilter,
    urgency: urgencyFilter,
    page,
    limit: 20,
    sortBy,
    sortOrder,
  });

  const tickets = data?.tickets || [];
  const totalPages = data?.pages || 0;

  return (
    <div
      className={`flex flex-col border-r border-gray-200 shrink-0 transition-all duration-200 ${selectedTicketId ? "hidden md:flex md:w-[400px] lg:w-[480px]" : "w-full"}`}
    >
      <div className="grow overflow-y-auto">
        {isLoading ? (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-5 border-b border-gray-200">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">
                Failed to load tickets
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Please check your connection and try again.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <div>
            {tickets.map((ticket) => (
              <TicketItem
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedTicketId === ticket.id}
                onClick={() => onTicketSelect(ticket.id)}
              />
            ))}

            {tickets.length === 0 && (
              <div className="py-20 text-center px-6">
                <Filter className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-base">No tickets found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-none p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
