"use client";

import React from "react";
import { ImportJobState } from "@/hooks/useBulkImport";
import { Loader2, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";

interface ImportProgressProps {
  jobState: ImportJobState;
}

export default function ImportProgress({ jobState }: ImportProgressProps) {
  const { status, success_count, failed_count } = jobState;

  if (status === "Idle") return null;

  const totalProcessed = success_count + failed_count;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
          <div>
            <p className="text-sm font-semibold text-slate-200">Import Job Progress</p>
            <p className="text-[10px] text-slate-500 font-mono">Job ID: {jobState.job_id}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {status === "Pending" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Pending
            </span>
          )}
          {status === "Processing" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
              Processing
            </span>
          )}
          {status === "Completed" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
          {status === "Failed" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Progress Tickers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Validated Orders</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{success_count}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rejected Rows</p>
          <p className="text-xl font-extrabold text-rose-400 mt-1">{failed_count}</p>
        </div>
      </div>

      {/* Progress Visual Bar */}
      {status === "Processing" && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            {/* Indeterminate moving bar since total columns might not be known ahead of time */}
            <div className="h-full w-1/3 rounded-full bg-indigo-500 animate-pulse"></div>
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            Processed {totalProcessed} rows so far...
          </p>
        </div>
      )}

      {status === "Completed" && (
        <div className="text-center py-1">
          <p className="text-xs text-slate-400">
            Import process completed. Seeding database is updated.
          </p>
        </div>
      )}
    </div>
  );
}
