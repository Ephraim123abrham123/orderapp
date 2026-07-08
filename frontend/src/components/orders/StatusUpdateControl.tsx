"use client";

import React, { useState } from "react";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { ORDER_STATUSES } from "@/lib/constants";
import { Check, Edit2, Loader2 } from "lucide-react";

interface StatusUpdateControlProps {
  orderId: number;
  currentStatus: string;
}

export default function StatusUpdateControl({ orderId, currentStatus }: StatusUpdateControlProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateOrderStatus();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ orderId, status: newStatus });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (updateMutation.isPending) {
    return (
      <div className="flex items-center text-slate-500 gap-1 text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Updating...</span>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
      >
        <Edit2 className="h-3 w-3" />
        <span>Change Status</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 animate-slide-in">
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button
        onClick={() => setIsEditing(false)}
        className="rounded-lg border border-slate-800 p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        title="Cancel editing"
      >
        <Check className="h-3 w-3 text-emerald-400" />
      </button>
    </div>
  );
}
