"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useWebSocket } from "./useWebSocket";
import { useUiStore } from "@/store/uiStore";

export interface ImportJobState {
  job_id: string | null;
  status: "Idle" | "Pending" | "Processing" | "Completed" | "Failed";
  success_count: number;
  failed_count: number;
  error_log: Array<{ row: number | string; error: string }>;
}

export function useBulkImport() {
  const [jobState, setJobState] = useState<ImportJobState>({
    job_id: null,
    status: "Idle",
    success_count: 0,
    failed_count: 0,
    error_log: [],
  });

  const { subscribe } = useWebSocket();
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);

  // API upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<{ job_id: string; status: string }>(
        "/orders/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setJobState({
        job_id: data.job_id,
        status: "Pending",
        success_count: 0,
        failed_count: 0,
        error_log: [],
      });
      addToast("File upload accepted. Processing started...", "info");
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail || "Upload failed";
      addToast(detail, "error");
    },
  });

  // Connect WebSocket listeners once we get a job_id
  useEffect(() => {
    if (!jobState.job_id) return;

    const handleProgress = (data: any) => {
      if (data.job_id !== jobState.job_id) return;
      setJobState((prev) => ({
        ...prev,
        status: data.status,
        success_count: data.success_count,
        failed_count: data.failed_count,
      }));
    };

    const handleComplete = (data: any) => {
      if (data.job_id !== jobState.job_id) return;
      setJobState((prev) => ({
        ...prev,
        status: data.status,
        success_count: data.success_count,
        failed_count: data.failed_count,
        error_log: data.error_log,
      }));

      // Auto-invalidate listings to populate newly inserted rows!
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });

      if (data.status === "Completed") {
        if (data.failed_count > 0) {
          addToast(
            `Import finished with warnings. Success: ${data.success_count}, Failed: ${data.failed_count}`,
            "info"
          );
        } else {
          addToast(`Successfully imported ${data.success_count} orders!`, "success");
        }
      } else {
        addToast("Bulk import failed. Please review error logs.", "error");
      }
    };

    const unsubProgress = subscribe("bulk_import_progress", handleProgress);
    const unsubComplete = subscribe("bulk_import_complete", handleComplete);

    return () => {
      unsubProgress();
      unsubComplete();
    };
  }, [jobState.job_id, subscribe, queryClient, addToast]);

  const resetImportState = () => {
    setJobState({
      job_id: null,
      status: "Idle",
      success_count: 0,
      failed_count: 0,
      error_log: [],
    });
    uploadMutation.reset();
  };

  return {
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    jobState,
    resetImportState,
  };
}
