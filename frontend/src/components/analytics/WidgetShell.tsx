"use client";

import React, { ReactNode } from "react";
import { GripVertical, Trash2 } from "lucide-react";

interface WidgetShellProps {
  title: string;
  onRemove?: () => void;
  children: ReactNode;
}

export default function WidgetShell({ title, onRemove, children }: WidgetShellProps) {
  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl backdrop-blur-xl group overflow-hidden">
      {/* Top Header chrome / controls */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div className="drag-handle cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-0.5 rounded transition">
            <GripVertical className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-slate-300 truncate tracking-wide">
            {title}
          </span>
        </div>

        {/* Action button: Remove widget */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition cursor-pointer"
            title="Remove widget"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Internal Content Pane */}
      <div className="flex-1 min-h-0 relative">
        {children}
      </div>
    </div>
  );
}
