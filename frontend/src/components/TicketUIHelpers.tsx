import { Ticket } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import React from "react";

export const getUrgencyConfig = (urgency?: string) => {
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

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "RESOLVED":
      return <Badge className="bg-blue-600 hover:bg-blue-700">Resolved</Badge>;
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

export const getSentimentIcon = (score: number | null | undefined) => {
  if (score === null || score === undefined)
    return <Meh className="w-4 h-4 text-gray-400" />;
  if (score >= 7) return <Smile className="w-4 h-4 text-emerald-500" />;
  if (score <= 4) return <Frown className="w-4 h-4 text-red-500" />;
  return <Meh className="w-4 h-4 text-amber-500" />;
};
