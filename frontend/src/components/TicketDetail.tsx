"use client";

import { useState } from "react";
import { Ticket } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, ArrowRight } from "lucide-react";
import {
  getUrgencyConfig,
  getStatusBadge,
  getSentimentIcon,
} from "./TicketUIHelpers";

interface TicketDetailProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (status: Ticket["status"], draft: string) => void;
  isUpdating: boolean;
}

export function TicketDetail({
  ticket,
  isOpen,
  onOpenChange,
  onUpdate,
  isUpdating,
}: TicketDetailProps) {
  const [draftEdit, setDraftEdit] = useState("");
  const [prevTicketId, setPrevTicketId] = useState<string | null>(null);

  if (ticket && ticket.id !== prevTicketId) {
    setPrevTicketId(ticket.id);
    setDraftEdit(ticket.aiDraft || "");
  }

  if (!ticket) return null;

  const handleUpdate = (status: Ticket["status"]) => {
    onUpdate(status, draftEdit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b relative overflow-hidden">
          {/* Visual Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {ticket.category || "Issue Details"}
                </DialogTitle>
                {getStatusBadge(ticket.status)}
              </div>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <User className="w-3 h-3 text-slate-400" />
                <span className="font-medium text-slate-600">
                  {ticket.customerEmail}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-400">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8">
          {/* Content Section */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Customer Description
            </h4>
            <div className="text-slate-700 bg-white border border-slate-200 p-6 rounded-2xl leading-relaxed text-sm shadow-sm ring-4 ring-slate-50">
              {ticket.content}
            </div>
          </section>

          {/* Analysis Grid */}
          <section className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Urgency
              </h4>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-fit ${getUrgencyConfig(ticket.urgency).color}`}
              >
                {getUrgencyConfig(ticket.urgency).icon}
                <span className="text-xs font-bold uppercase">
                  {ticket.urgency || "Pending"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Sentiment
              </h4>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                {getSentimentIcon(ticket.sentiment)}
                <span className="text-xs font-bold text-slate-700">
                  {ticket.sentiment !== null && ticket.sentiment !== undefined
                    ? `${ticket.sentiment}/10`
                    : "Wait..."}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Reference ID
              </h4>
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                <span className="text-[10px] font-mono font-medium text-slate-500">
                  #{ticket.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </section>

          <Separator />

          {/* AI Draft Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                AI Proposed Response
              </h4>
              <Badge
                variant="outline"
                className="text-primary border-primary/20 bg-primary/5 text-[9px] font-black uppercase"
              >
                Alpha Brain v2
              </Badge>
            </div>

            <div className="relative group">
              <Textarea
                className="min-h-[220px] bg-slate-900 text-slate-100 font-mono text-sm leading-relaxed p-6 rounded-2xl border-0 focus-visible:ring-offset-0 focus-visible:ring-primary shadow-2xl transition-all"
                value={draftEdit}
                onChange={(e) => setDraftEdit(e.target.value)}
                placeholder="Generating response..."
                disabled={ticket.status === "RESOLVED"}
              />
              {ticket.status === "RESOLVED" && (
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                  <Badge className="bg-white text-slate-900 border shadow-md font-bold">
                    Resolved & Archived
                  </Badge>
                </div>
              )}
            </div>
          </section>
        </div>

        <DialogFooter className="p-8 bg-slate-50/50 border-t flex items-center sm:justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-900"
          >
            Close View
          </Button>

          <div className="flex items-center gap-3">
            {ticket.status === "RESOLVED" ? (
              <Button
                variant="outline"
                onClick={() => handleUpdate("PROCESSED")}
                className="border-slate-200"
                disabled={isUpdating}
              >
                Reopen Ticket
              </Button>
            ) : (
              <Button
                onClick={() => handleUpdate("RESOLVED")}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 gap-2 min-w-[140px]"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  "Updating..."
                ) : (
                  <>
                    Resolve Ticket
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
