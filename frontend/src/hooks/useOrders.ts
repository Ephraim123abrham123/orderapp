"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useWebSocket } from "./useWebSocket";
import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";

export interface Order {
  id: number;
  customer_name: string;
  amount: number;
  currency: string;
  usd_amount: number;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
}

interface OrdersResponse {
  items: Order[];
  total: int;
  page: int;
  size: int;
}

export function useOrders(
  page: int = 1,
  size: int = 10,
  search?: string,
  status?: string
) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  const addToast = useUiStore((state) => state.addToast);

  // Main React Query for listing orders
  const ordersQuery = useQuery({
    queryKey: ["orders", page, size, search, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, size };
      if (search) params.search = search;
      if (status) params.status = status;
      
      const response = await apiClient.get<OrdersResponse>("/orders", { params });
      return response.data;
    },
  });

  // Listen to live WebSocket events to invalidate and update list reactively!
  useEffect(() => {
    const unsubscribe = subscribe("order_status_changed", (data: any) => {
      // Invalidate both orders lists and analytics metrics queries!
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });

      // Notify the user of real-time update
      const { order_id, old_status, new_status, order } = data;
      
      if (old_status === "None") {
        addToast(`New order #${order_id} created for ${order.customer_name}`, "success");
      } else {
        addToast(
          `Order #${order_id} status updated: ${old_status} ➜ ${new_status}`,
          "info"
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, queryClient, addToast]);

  return ordersQuery;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (newOrder: { customer_name: string; amount: number; currency: string; status?: string }) => {
      const response = await apiClient.post<Order>("/orders", newOrder);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      addToast(`Order for ${data.customer_name} created successfully!`, "success");
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail || "Failed to create order";
      addToast(detail, "error");
    }
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiClient.put<Order>(`/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      // Invalidate individual order details
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      addToast(`Order #${data.id} status updated to ${data.status}`, "success");
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail || "Failed to update order status";
      addToast(detail, "error");
    }
  });
}

export function useOrderDetails(orderId: number) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await apiClient.get<Order>(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
}
