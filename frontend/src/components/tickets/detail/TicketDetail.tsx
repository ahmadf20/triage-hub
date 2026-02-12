import { useState } from "react";
import { Ticket } from "@/module/tickets/models/Ticket";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, ArrowRight, AlertCircle } from "lucide-react";
import {
  getUrgencyConfig,
  getStatusBadge,
  getSentimentIcon,
} from "../list/TicketUIHelpers";
import { useTicket } from "@/module/tickets/hooks/useTicket";
import { useUpdateTicket } from "@/module/tickets/hooks/useUpdateTicket";
import { toast } from "sonner";

type TicketDetailProps = {
  ticketId: string | null;
  onClose: () => void;
};

export function TicketDetail({ ticketId, onClose }: TicketDetailProps) {
  const { data: ticket, isLoading, isError } = useTicket(ticketId);

  const [draftEdit, setDraftEdit] = useState("");
  if (ticket?.aiDraft && ticket.aiDraft !== draftEdit) {
    setDraftEdit(ticket.aiDraft);
  }

  const updateMutation = useUpdateTicket();

  const handleUpdate = (status: Ticket["status"]) => {
    if (!ticketId) return;

    updateMutation.mutate(
      {
        id: ticketId,
        status,
        aiDraft: draftEdit,
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

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState onClose={onClose} />;
  if (!ticket) return null;

  const isUpdating = updateMutation.isPending;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {ticket.category?.replace(/_/g, " ") || "UNKNOWN"}
            </h3>
            {getStatusBadge(ticket.status)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{ticket.customerEmail}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">
              {new Date(ticket.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grow p-5 space-y-6 overflow-y-auto">
        <section className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase">
            Customer Message
          </h4>
          <div className="text-sm text-gray-900 border border-gray-200 p-4 bg-gray-50 rounded-md">
            {ticket.content}
          </div>
        </section>

        <section className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase">
              Priority
            </h4>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 border w-fit text-xs font-medium rounded-md ${getUrgencyConfig(ticket.urgency).color}`}
            >
              {getUrgencyConfig(ticket.urgency).icon}
              <span>{ticket.urgency || "NONE"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase">
              Sentiment
            </h4>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 w-fit text-xs rounded-md">
              {getSentimentIcon(ticket.sentiment)}
              <span className="font-medium text-gray-700">
                {ticket.sentiment !== null && ticket.sentiment !== undefined
                  ? `${ticket.sentiment}/10`
                  : "NONE"}
              </span>
            </div>
          </div>
        </section>

        {ticket.status === "RESOLVED" && ticket.updatedAt && (
          <section className="bg-green-50 border border-green-200 p-4 rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-green-900">Resolved on:</span>
              <span className="text-green-700">
                {new Date(ticket.updatedAt).toLocaleString()}
              </span>
            </div>
          </section>
        )}

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase">
              AI Response Draft
            </h4>
            <div className="flex items-center gap-2">
              {ticket.status === "RESOLVED" && (
                <Badge className="bg-gray-900 text-white text-xs">
                  Resolved & Archived
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                AI Generated
              </Badge>
            </div>
          </div>

          <Textarea
            className="min-h-[200px] font-mono text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-400 rounded-md"
            value={draftEdit}
            onChange={(e) => setDraftEdit(e.target.value)}
            placeholder="Generating response..."
            disabled={ticket.status === "RESOLVED"}
          />
        </section>
      </div>

      <div className="flex-none p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
        {ticket.status === "RESOLVED" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdate("PROCESSED")}
            disabled={isUpdating}
          >
            Reopen Ticket
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => handleUpdate("RESOLVED")}
            disabled={isUpdating}
          >
            {isUpdating ? (
              "Updating..."
            ) : (
              <>
                Resolve
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-gray-200">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="grow p-5 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="flex gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onClose }: { onClose: () => void }) {
  return (
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
  );
}
