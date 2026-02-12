import TicketDashboard from "@/components/tickets/TicketDashboard";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense>
        <TicketDashboard />
      </Suspense>
    </main>
  );
}
