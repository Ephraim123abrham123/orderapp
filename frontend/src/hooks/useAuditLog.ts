"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useWebSocket } from "./useWebSocket";
import { useEffect } from "react";

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: number | null;
  timestamp: string;
}

interface AuditLogResponse {
  items: AuditLog[];
  total: number;
  page: number;
  size: number;
}

export function useAuditLog(page: number = 1, size: number = 10) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const query = useQuery({
    queryKey: ["audit_logs", page, size],
    queryFn: async () => {
      const response = await apiClient.get<AuditLogResponse>("/audit-log", {
        params: { page, size },
      });
      return response.data;
    },
  });

  useEffect(() => {
    const unsubscribe = subscribe("audit_log_created", () => {
      queryClient.invalidateQueries({ queryKey: ["audit_logs"] });
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, queryClient]);

  return query;
}
