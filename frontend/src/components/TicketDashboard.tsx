"use client";

import { useEffect, useState } from "react";
import { Ticket } from "@/types";
import { createTicket, getTickets, updateTicket } from "@/lib/api";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Plus,
  ArrowRight,
  User,
  Mail,
  Zap,
  Smile,
  Frown,
  Meh,
} from "lucide-react";

export default function TicketDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketContent, setNewTicketContent] = useState("");
  const [newTicketEmail, setNewTicketEmail] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  // Detail View
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [draftEdit, setDraftEdit] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [statusFilter, urgencyFilter]);

  const fetchTickets = async () => {
    try {
      if (tickets.length === 0) setLoading(true);
      const data = await getTickets(statusFilter, urgencyFilter);
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      toast.error("Failed to sync with server");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      if (!newTicketContent || !newTicketEmail) {
        toast.error("Please fill in all fields");
        return;
      }
      setLoading(true);
      await createTicket(newTicketContent, newTicketEmail);
      setIsNewTicketOpen(false);
      setNewTicketContent("");
      setNewTicketEmail("");
      fetchTickets();
      toast.success("Ticket created successfully!", {
        description: "AI is triaging your request now.",
      });
    } catch (error) {
      console.error("Failed to create ticket", error);
      toast.error("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDraftEdit(ticket.aiDraft || "");
    setIsDetailOpen(true);
  };

  const handleUpdateTicket = async (
    status: "PENDING" | "PROCESSED" | "RESOLVED",
  ) => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    try {
      await updateTicket(selectedTicket.id, {
        status,
        aiDraft: draftEdit,
      });
      setIsDetailOpen(false);
      fetchTickets();
      toast.success(
        status === "RESOLVED" ? "Ticket resolved!" : "Ticket updated",
      );
    } catch (error) {
      console.error("Failed to update ticket", error);
      toast.error("Failed to update ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  const getUrgencyConfig = (urgency?: string) => {
    switch (urgency) {
      case "HIGH":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <AlertCircle className="w-3 h-3" />,
        };
      case "MEDIUM":
        return {
          color: "text-amber-600 bg-amber-50 border-amber-200",
          icon: <Clock className="w-3 h-3" />,
        };
      case "LOW":
        return {
          color: "text-emerald-600 bg-emerald-50 border-emerald-200",
          icon: <CheckCircle2 className="w-3 h-3" />,
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          icon: <MessageSquare className="w-3 h-3" />,
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">Resolved</Badge>
        );
      case "PROCESSED":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 font-medium">
            Ready
          </Badge>
        );
      case "FAILED":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return (
          <Badge variant="secondary" className="font-normal">
            Processing
          </Badge>
        );
    }
  };

  const getSentimentIcon = (score: number | null) => {
    if (score === null) return <Meh className="w-4 h-4 text-gray-400" />;
    if (score >= 7) return <Smile className="w-4 h-4 text-emerald-500" />;
    if (score <= 4) return <Frown className="w-4 h-4 text-red-500" />;
    return <Meh className="w-4 h-4 text-amber-500" />;
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
                    disabled={!newTicketContent || !newTicketEmail || loading}
                  >
                    {loading ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 mt-10">
        {loading && tickets.length === 0 ? (
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
                          {ticket.sentiment !== null
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

      {/* Ticket Details Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selectedTicket && (
            <>
              <DialogHeader className="p-8 pb-6 bg-slate-50/50 border-b relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <DialogTitle className="text-2xl font-bold text-slate-900">
                        {selectedTicket.category || "Issue Details"}
                      </DialogTitle>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="font-medium text-slate-600">
                        {selectedTicket.customerEmail}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
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
                    {selectedTicket.content}
                  </div>
                </section>

                {/* Analysis Grid */}
                <section className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Urgency
                    </h4>
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-fit ${getUrgencyConfig(selectedTicket.urgency).color}`}
                    >
                      {getUrgencyConfig(selectedTicket.urgency).icon}
                      <span className="text-xs font-bold uppercase">
                        {selectedTicket.urgency || "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Sentiment
                    </h4>
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                      {getSentimentIcon(selectedTicket.sentiment)}
                      <span className="text-xs font-bold text-slate-700">
                        {selectedTicket.sentiment !== null
                          ? `${selectedTicket.sentiment}/10`
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
                        #{selectedTicket.id.slice(0, 8).toUpperCase()}
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
                      disabled={selectedTicket.status === "RESOLVED"}
                    />
                    {selectedTicket.status === "RESOLVED" && (
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
                  onClick={() => setIsDetailOpen(false)}
                  className="text-slate-500 hover:text-slate-900"
                >
                  Close View
                </Button>

                <div className="flex items-center gap-3">
                  {selectedTicket.status === "RESOLVED" ? (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateTicket("PROCESSED")}
                      className="border-slate-200"
                      disabled={isUpdating}
                    >
                      Reopen Ticket
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpdateTicket("RESOLVED")}
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
