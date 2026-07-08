"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useWebSocket } from "./useWebSocket";
import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";

export interface WidgetConfig {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "kpi" | "revenue_trend" | "status_pie" | "top_customers" | string;
  title: string;
  metric: string;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
}

export interface MetricData {
  metrics: {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    revenue_trend: Array<{ date: string; revenue: number }>;
    status_breakdown: Array<{ status: string; count: number; value: number }>;
    top_customers: Array<{ customer_name: string; revenue: number; orders_count: number }>;
    [key: string]: any;
  };
}

export function useAnalytics() {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const query = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await apiClient.get<MetricData>("/analytics/metrics");
      return response.data;
    },
  });

  // Automatically update analytics charts when bulk imports or orders change via WebSockets!
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    };

    const unsubStatus = subscribe("order_status_changed", handleUpdate);
    const unsubImport = subscribe("bulk_import_complete", handleUpdate);

    return () => {
      unsubStatus();
      unsubImport();
    };
  }, [subscribe, queryClient]);

  return query;
}

export function useDashboardLayout() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);

  const getQuery = useQuery({
    queryKey: ["layout"],
    queryFn: async () => {
      const response = await apiClient.get<DashboardLayout>("/analytics/layout");
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newLayout: DashboardLayout) => {
      const response = await apiClient.post<DashboardLayout>(
        "/analytics/layout",
        newLayout
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layout"] });
      addToast("Dashboard layout updated successfully", "success");
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail || "Failed to save dashboard layout";
      addToast(detail, "error");
    },
  });

  return {
    layout: getQuery.data?.widgets || [],
    isLoading: getQuery.isLoading,
    saveLayout: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
