import { useTicket } from "@/module/tickets/hooks/useTicket";
import { useUpdateTicket } from "@/module/tickets/hooks/useUpdateTicket";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { TicketDetail } from "./TicketDetail";
import { Ticket } from "@/module/tickets/models/Ticket";
import { toast } from "sonner";

type TicketDetailPanelProps = {
  selectedTicketId: string | null;
  onClose: () => void;
};

export function TicketDetailPanel({
  selectedTicketId,
  onClose,
}: TicketDetailPanelProps) {
  const {
    data: selectedTicket,
    isLoading,
    isError,
  } = useTicket(selectedTicketId);

  const updateMutation = useUpdateTicket();

  const handleUpdateTicket = (status: Ticket["status"], aiDraft: string) => {
    if (!selectedTicketId) return;

    updateMutation.mutate(
      {
        id: selectedTicketId,
        status,
        aiDraft,
      },
      {
        onSuccess: () => {
          toast.success("Ticket updated successfully!");
        },
        onError: () => {
          toast.error("Failed to update ticket");
        },
      },
    );
  };

  return (
    <div
      className={`grow bg-white overflow-y-auto transition-all duration-300 ${selectedTicketId ? "flex flex-col" : "hidden md:flex md:flex-col opacity-0 translate-x-4 pointer-events-none"}`}
    >
      {selectedTicketId ? (
        <div className="h-full flex flex-col">
          <div className="flex-none p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to list
            </Button>
          </div>
          <div className="grow">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-900">
                    Failed to load ticket
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    This ticket may not exist or there was a connection error.
                  </p>
                </div>
                <Button variant="outline" onClick={onClose}>
                  Back to list
                </Button>
              </div>
            ) : selectedTicket ? (
              <TicketDetail
                ticket={selectedTicket}
                isOpen={true}
                onOpenChange={(open) => !open && onClose()}
                onUpdate={handleUpdateTicket}
                isUpdating={updateMutation.isPending}
                isSidebar={true}
                isLoading={false}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex-none p-4 border-b flex items-center justify-between md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Back to list
            </Button>
          </div>
          <div className="grow flex items-center justify-center text-slate-300 p-8 text-center">
            <div>
              <p className="text-lg font-medium">
                Select a ticket to view details
              </p>
              <p className="text-sm opacity-60">
                High-priority items are highlighted for immediate triage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
