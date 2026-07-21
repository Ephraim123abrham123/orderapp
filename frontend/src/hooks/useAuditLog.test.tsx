import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuditLog } from "./useAuditLog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock the apiClient
vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
      },
    }),
  },
}));

// Mock useWebSocket
let wsCallback: ((data: any) => void) | null = null;
const mockUnsubscribe = vi.fn();
const mockSubscribe = vi.fn().mockImplementation((event: string, callback: (data: any) => void) => {
  if (event === "audit_log_created") {
    wsCallback = callback;
  }
  return mockUnsubscribe;
});

vi.mock("./useWebSocket", () => ({
  useWebSocket: () => ({
    status: "connected",
    subscribe: mockSubscribe,
    send: vi.fn(),
  }),
}));

describe("useAuditLog hook WebSocket synchronization", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
    wsCallback = null;
  });

  it("should subscribe to 'audit_log_created' WebSocket event and invalidate queries on event broadcast", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Spy on invalidateQueries
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // Render the hook
    renderHook(() => useAuditLog(1, 10), { wrapper });

    // Assert that the hook subscribed to 'audit_log_created'
    expect(mockSubscribe).toHaveBeenCalledWith("audit_log_created", expect.any(Function));
    expect(wsCallback).toBeTypeOf("function");

    // Simulate receiving a WebSocket audit log created event
    if (wsCallback) {
      wsCallback({
        id: 1,
        entity_type: "order",
        entity_id: 42,
        action: "status_change",
        old_value: "Pending",
        new_value: "Processing",
        changed_by: 2,
        timestamp: "2026-07-21T11:30:00Z",
      });
    }

    // Verify cache invalidation was triggered for audit_logs
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["audit_logs"] });
  });
});
