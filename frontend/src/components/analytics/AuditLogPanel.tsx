"use client";

import React, { useState } from "react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { ClipboardList, Clock, ArrowRight, User, Activity } from "lucide-react";

export default function AuditLogPanel() {
  const [page, setPage] = useState(1);
  const size = 10;
  const { data, isLoading, error } = useAuditLog(page, size);

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return (
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        " " +
        date.toLocaleDateString([], { month: "short", day: "numeric" })
      );
    } catch {
      return isoStr;
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return "text-slate-400 bg-slate-900/60";
    switch (status) {
      case "Pending":
        return "text-amber-400 bg-amber-400/10 border-amber-500/20";
      case "Processing":
        return "text-blue-400 bg-blue-400/10 border-blue-500/20";
      case "Completed":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-500/20";
      case "Cancelled":
        return "text-rose-400 bg-rose-400/10 border-rose-500/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-500/20";
    }
  };

  const totalPages = data ? Math.ceil(data.total / size) : 1;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col h-full space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Live Audit Log</h2>
            <p className="text-xs text-slate-500">Real-time status change log tracker</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span>Live Sync Active</span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center py-12 space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <span className="text-xs text-slate-500 font-medium">Fetching mutation logs...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-1 items-center justify-center text-xs text-rose-400 py-12 bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
          Failed to fetch audit logs.
        </div>
      )}

      {/* Data display */}
      {!isLoading && !error && data && (
        <div className="flex-1 flex flex-col justify-between">
          {data.items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center py-16 space-y-2">
              <Activity className="h-8 w-8 text-slate-700" />
              <p className="text-xs text-slate-500">No actions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[10px] bg-slate-950/20">
                    <th className="py-2.5 px-4 font-semibold">Entity</th>
                    <th className="py-2.5 px-4 font-semibold">Action</th>
                    <th className="py-2.5 px-4 font-semibold">Mutation</th>
                    <th className="py-2.5 px-4 font-semibold">Actor ID</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {data.items.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/20 transition duration-150">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {log.entity_type.toUpperCase()} #{log.entity_id}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-medium">
                        {log.action.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusColor(log.old_value)}`}>
                            {log.old_value || "None"}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-600" />
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusColor(log.new_value)}`}>
                            {log.new_value}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-400">
                          <User className="h-3 w-3 text-slate-500" />
                          <span className="font-mono">ID {log.changed_by || "System"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-medium whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="h-3 w-3 text-slate-600" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-4">
              <span className="text-[10px] text-slate-500 font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
