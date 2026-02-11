"use client";

import { useState } from "react";
import { Ticket } from "@/types";
import { createTicket, getTickets, updateTicket } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Clock, Filter, Plus, Mail, Zap } from "lucide-react";
import { TicketDetail } from "./TicketDetail";
import {
  getUrgencyConfig,
  getStatusBadge,
  getSentimentIcon,
} from "./TicketUIHelpers";

export default function TicketDashboard() {
  const queryClient = useQueryClient();
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketContent, setNewTicketContent] = useState("");
  const [newTicketEmail, setNewTicketEmail] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  // Detail View
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // React Query: Fetch Tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets", statusFilter, urgencyFilter],
    queryFn: () => getTickets(statusFilter, urgencyFilter),
    refetchInterval: 5000, // Sync with server every 5 seconds
  });

  // React Query: Create Ticket
  const createMutation = useMutation({
    mutationFn: ({ content, email }: { content: string; email: string }) =>
      createTicket(content, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setIsNewTicketOpen(false);
      setNewTicketContent("");
      setNewTicketEmail("");
      toast.success("Ticket created successfully!", {
        description: "AI is triaging your request now.",
      });
    },
    onError: () => {
      toast.error("Failed to create ticket");
    },
  });

  // React Query: Update Ticket
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      aiDraft,
    }: {
      id: string;
      status: Ticket["status"];
      aiDraft: string;
    }) => updateTicket(id, { status, aiDraft }),
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      // Update local selection if it's the same ticket
      if (selectedTicket?.id === updatedTicket.id) {
        setSelectedTicket(updatedTicket);
      }
      setIsDetailOpen(false);
      toast.success("Ticket updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update ticket");
    },
  });

  const handleCreateTicket = () => {
    if (!newTicketContent || !newTicketEmail) {
      toast.error("Please fill in all fields");
      return;
    }
    createMutation.mutate({ content: newTicketContent, email: newTicketEmail });
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleUpdateTicket = (status: Ticket["status"], aiDraft: string) => {
    if (!selectedTicket) return;
    updateMutation.mutate({
      id: selectedTicket.id,
      status,
      aiDraft,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Premium Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-xl p-2 text-primary-foreground shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Triage Hub
              </h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground mt-1">
                AI Intelligence Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 border-none bg-transparent shadow-none focus:ring-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All States</SelectItem>
                  <SelectItem value="PENDING">Processing</SelectItem>
                  <SelectItem value="PROCESSED">Ready</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-4 bg-slate-300" />

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-[140px] h-9 border-none bg-transparent shadow-none focus:ring-0">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="HIGH">High Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2 rounded-lg shadow-md shadow-primary/10"
                >
                  <Plus className="w-4 h-4" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Create Ticket</DialogTitle>
                  <DialogDescription>
                    Submit a new support request for AI triage.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      User Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        placeholder="user@example.com"
                        className="pl-9 h-11 bg-slate-50 border-slate-200"
                        value={newTicketEmail}
                        onChange={(e) => setNewTicketEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="content" className="text-sm font-semibold">
                      Issue Details
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Describe the problem..."
                      className="min-h-[120px] bg-slate-50 border-slate-200 resize-none"
                      value={newTicketContent}
                      onChange={(e) => setNewTicketContent(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateTicket}
                    className="w-full h-11"
                    disabled={
                      !newTicketContent ||
                      !newTicketEmail ||
                      createMutation.isPending
                    }
                  >
                    {createMutation.isPending
                      ? "Submitting..."
                      : "Submit Ticket"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 mt-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium animate-pulse">
              Syncing Hub...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tickets.map((ticket) => {
              const urgency = getUrgencyConfig(ticket.urgency);
              return (
                <Card
                  key={ticket.id}
                  className="group relative bg-white border-slate-200 hover:border-primary/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
                  onClick={() => handleTicketClick(ticket)}
                >
                  {/* Category Accent */}
                  <div
                    className={`absolute top-0 right-0 h-1 w-full bg-slate-100 group-hover:bg-primary/20 transition-colors`}
                  ></div>

                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${urgency.color}`}
                      >
                        {urgency.icon}
                        {ticket.urgency || "PENDING"}
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {ticket.category || "General"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 pt-0 grow">
                    <p className="text-sm font-semibold text-slate-700 line-clamp-3 leading-relaxed min-h-[4.5rem]">
                      {ticket.content}
                    </p>
                  </CardContent>

                  <Separator className="bg-slate-100" />

                  <CardFooter className="px-5 py-3.5 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-400">
                        {getSentimentIcon(ticket.sentiment)}
                        <span className="text-[11px] font-bold">
                          {ticket.sentiment !== null &&
                          ticket.sentiment !== undefined
                            ? `${ticket.sentiment}/10`
                            : "—"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </CardFooter>
                </Card>
              );
            })}

            {tickets.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl py-24 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">
                  No tickets found
                </h3>
                <p className="text-slate-500 max-w-xs mt-1">
                  Adjust your filters or create a new ticket to see results.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <TicketDetail
        ticket={selectedTicket}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={handleUpdateTicket}
        isUpdating={updateMutation.isPending}
      />
    </div>
  );
}
