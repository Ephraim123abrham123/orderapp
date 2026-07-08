"use client";

import React, { useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { WebSocketProvider } from "@/hooks/useWebSocket";
import ToastContainer from "@/components/common/ToastContainer";

export default function Providers({ children }: { children: ReactNode }) {
  // Instantiate QueryClient in state to prevent recreations on rerender
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          {children}
          <ToastContainer />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
