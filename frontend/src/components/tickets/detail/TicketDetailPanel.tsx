import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { TicketDetail } from "./TicketDetail";

type TicketDetailPanelProps = {
  selectedTicketId: string | null;
  onClose: () => void;
};

export function TicketDetailPanel({
  selectedTicketId,
  onClose,
}: TicketDetailPanelProps) {
  return (
    <div
      className={`grow bg-white overflow-y-auto transition-all duration-300 ${selectedTicketId ? "flex flex-col" : "hidden md:flex md:flex-col opacity-0 translate-x-4 pointer-events-none"}`}
    >
      <div className="h-full flex flex-col">
        <div className="flex-none p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to list
          </Button>
        </div>
        <div className="grow">
          <TicketDetail ticketId={selectedTicketId} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
