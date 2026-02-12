import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type TicketFiltersProps = {
  statusFilter: string;
  urgencyFilter: string;
  sortBy: string;
  sortOrder: string;
  onFilterChange: (params: Record<string, string | number>) => void;
  variant?: "mobile" | "desktop";
};

export function TicketFilters({
  statusFilter,
  urgencyFilter,
  sortBy,
  sortOrder,
  onFilterChange,
  variant = "desktop",
}: TicketFiltersProps) {
  const isMobile = variant === "mobile";

  return (
    <div className={isMobile ? "grid gap-4 p-4" : "flex items-center gap-3"}>
      <div className={isMobile ? "space-y-2" : ""}>
        {isMobile && <Label className="text-sm font-medium">Status</Label>}
        <Select
          value={statusFilter}
          onValueChange={(v) => onFilterChange({ status: v, page: 1 })}
        >
          <SelectTrigger className={isMobile ? "" : "w-[140px]"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {isMobile ? "All" : "All status"}
            </SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSED">Processed</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={isMobile ? "space-y-2" : ""}>
        {isMobile && <Label className="text-sm font-medium">Priority</Label>}
        <Select
          value={urgencyFilter}
          onValueChange={(v) => onFilterChange({ urgency: v, page: 1 })}
        >
          <SelectTrigger className={isMobile ? "" : "w-[140px]"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {isMobile ? "All" : "All priority"}
            </SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={isMobile ? "space-y-2" : ""}>
        {isMobile && <Label className="text-sm font-medium">Sort by</Label>}
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(v) => {
            const [field, order] = v.split("-");
            onFilterChange({ sortBy: field, sortOrder: order, page: 1 });
          }}
        >
          <SelectTrigger className={isMobile ? "" : "w-[140px]"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest first</SelectItem>
            <SelectItem value="createdAt-asc">Oldest first</SelectItem>
            <SelectItem value="urgency-desc">High priority</SelectItem>
            <SelectItem value="urgency-asc">Low priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
