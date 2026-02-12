"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketListener } from "@/components/SocketListener";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: false,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketListener />
      {children}
    </QueryClientProvider>
  );
}
