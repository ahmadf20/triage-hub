import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ListFilter } from "lucide-react";
import { TicketFilters } from "./TicketFilters";

type MobileFilterSheetProps = {
  statusFilter: string;
  urgencyFilter: string;
  sortBy: string;
  sortOrder: string;
  onFilterChange: (params: Record<string, string | number>) => void;
};

export function MobileFilterSheet({
  statusFilter,
  urgencyFilter,
  sortBy,
  sortOrder,
  onFilterChange,
}: MobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <ListFilter className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <TicketFilters
          statusFilter={statusFilter}
          urgencyFilter={urgencyFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onFilterChange={onFilterChange}
          variant="mobile"
        />
      </SheetContent>
    </Sheet>
  );
}
