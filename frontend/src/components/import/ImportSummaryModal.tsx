import React from "react";
import { AlertCircle, FileX } from "lucide-react";

interface ErrorLogItem {
  row: number | string;
  error: string;
}

interface ImportSummaryModalProps {
  errorLog: ErrorLogItem[];
}

export default function ImportSummaryModal({ errorLog }: ImportSummaryModalProps) {
  if (errorLog.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 text-xs font-semibold text-slate-300">
        <FileX className="h-5 w-5 text-rose-400" />
        <span>Failed Row Validation Details ({errorLog.length})</span>
      </div>

      {/* Errors list table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 max-h-[220px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-4 w-20">Row</th>
              <th className="py-2.5 px-4">Failure Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
            {errorLog.map((log, index) => (
              <tr key={index} className="hover:bg-slate-900/10 transition">
                <td className="py-2.5 px-4 font-mono font-bold text-slate-400">
                  {log.row}
                </td>
                <td className="py-2.5 px-4 text-rose-300/90 leading-normal flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />
                  <span>{log.error}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-slate-500 text-center leading-normal">
        Only valid rows have been successfully inserted. Review your local spreadsheet, correct the rejected rows listed above, and re-upload to append remaining items.
      </p>
    </div>
  );
}
