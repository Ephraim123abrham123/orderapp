import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOrders } from "./useOrders";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock the uiStore
const mockAddToast = vi.fn();
vi.mock("@/store/uiStore", () => ({
  useUiStore: (selector: any) => {
    return mockAddToast;
  },
}));

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
  if (event === "order_status_changed") {
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

describe("useOrders hook WebSocket synchronization", () => {
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

  it("should subscribe to 'order_status_changed' WebSocket event and invalidate queries on event broadcast", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Spy on invalidateQueries
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    // Render the hook
    renderHook(() => useOrders(1, 10), { wrapper });

    // Assert that the hook subscribed to 'order_status_changed'
    expect(mockSubscribe).toHaveBeenCalledWith("order_status_changed", expect.any(Function));
    expect(wsCallback).toBeTypeOf("function");

    // Simulate receiving a WebSocket status change event
    if (wsCallback) {
      wsCallback({
        order_id: 42,
        old_status: "Pending",
        new_status: "Processing",
        order: { id: 42, customer_name: "John Doe" },
      });
    }

    // Verify cache invalidations were triggered
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["orders"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["metrics"] });

    // Verify toast notice was displayed
    expect(mockAddToast).toHaveBeenCalledWith(
      "Order #42 status updated: Pending ➜ Processing",
      "info"
    );
  });
});
