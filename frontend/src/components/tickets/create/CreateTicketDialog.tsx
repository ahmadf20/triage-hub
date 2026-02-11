import { useState } from "react";
import { useCreateTicket } from "@/module/tickets/hooks/useCreateTicket";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Plus, Mail } from "lucide-react";
import { toast } from "sonner";

export function CreateTicketDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");

  const createMutation = useCreateTicket();

  const handleSubmit = () => {
    if (!content || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    createMutation.mutate(
      { content, customerEmail: email },
      {
        onSuccess: () => {
          toast.success("Ticket created successfully!");
          setIsOpen(false);
          setContent("");
          setEmail("");
        },
        onError: () => {
          toast.error("Failed to create ticket");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Ticket</DialogTitle>
          <DialogDescription>Submit a new support request.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="email">User Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="user@example.com"
                className="pl-9 h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="content">Issue Details</Label>
            <Textarea
              id="content"
              placeholder="Describe the problem..."
              className="min-h-[100px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Submitting..." : "Submit Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
