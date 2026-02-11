"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { TicketFilters } from "./filter/TicketFilters";
import { CreateTicketDialog } from "./create/CreateTicketDialog";
import { MobileFilterSheet } from "./filter/MobileFilterSheet";
import { TicketList } from "./list/TicketList";
import { TicketDetailPanel } from "./detail/TicketDetailPanel";

export default function TicketDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusFilter = searchParams.get("status") || "ALL";
  const urgencyFilter = searchParams.get("urgency") || "ALL";
  const page = parseInt(searchParams.get("page") || "1");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const selectedTicketId = searchParams.get("ticketId");

  const updateUrl = (params: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(params)) {
      if (value === null) newSearchParams.delete(key);
      else newSearchParams.set(key, String(value));
    }

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex-none border-b border-gray-200">
        <div className="px-6 h-14 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Triage Hub</h1>

          <div className="flex items-center gap-3">
            <MobileFilterSheet
              statusFilter={statusFilter}
              urgencyFilter={urgencyFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onFilterChange={updateUrl}
            />

            <div className="hidden lg:flex">
              <TicketFilters
                statusFilter={statusFilter}
                urgencyFilter={urgencyFilter}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onFilterChange={updateUrl}
                variant="desktop"
              />
            </div>

            <CreateTicketDialog />
          </div>
        </div>
      </header>

      <main className="grow flex overflow-hidden border-t border-gray-200">
        <TicketList
          statusFilter={statusFilter}
          urgencyFilter={urgencyFilter}
          page={page}
          sortBy={sortBy}
          sortOrder={sortOrder as "asc" | "desc"}
          selectedTicketId={selectedTicketId}
          onTicketSelect={(ticketId) => updateUrl({ ticketId })}
          onPageChange={(newPage) => updateUrl({ page: newPage })}
        />

        <TicketDetailPanel
          selectedTicketId={selectedTicketId}
          onClose={() => updateUrl({ ticketId: null })}
        />
      </main>
    </div>
  );
}
