"use client";

import React from "react";
import { useUiStore } from "@/store/uiStore";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let bgColor = "bg-slate-900 border-slate-800 text-slate-100";
        let Icon = Info;
        let iconColor = "text-indigo-400";

        if (toast.type === "success") {
          bgColor = "bg-emerald-950/90 border-emerald-800 text-emerald-100";
          Icon = CheckCircle;
          iconColor = "text-emerald-400";
        } else if (toast.type === "error") {
          bgColor = "bg-rose-950/90 border-rose-800 text-rose-100";
          Icon = AlertTriangle;
          iconColor = "text-rose-400";
        } else if (toast.type === "info") {
          bgColor = "bg-indigo-950/90 border-indigo-800 text-indigo-100";
          Icon = Info;
          iconColor = "text-indigo-400";
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md animate-slide-in ${bgColor}`}
            role="alert"
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconColor} mt-0.5`} />
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-0.5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
