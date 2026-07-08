import React from "react";

interface StatusBadgeProps {
  status: "Pending" | "Processing" | "Completed" | "Cancelled" | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let badgeColor = "bg-slate-800 text-slate-300 border-slate-700";

  switch (status) {
    case "Completed":
      badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      break;
    case "Processing":
      badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      break;
    case "Pending":
      badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      break;
    case "Cancelled":
      badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${badgeColor}`}>
      {status}
    </span>
  );
}
