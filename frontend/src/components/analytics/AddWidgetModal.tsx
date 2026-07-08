"use client";

import React from "react";
import { AVAILABLE_WIDGET_CATALOG } from "./WidgetRegistry";
import { X, Plus, BarChart2 } from "lucide-react";

interface AddWidgetModalProps {
  onClose: () => void;
  onAdd: (type: string, metric: string, title: string) => void;
}

export default function AddWidgetModal({ onClose, onAdd }: AddWidgetModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-400" />
            <span>Add Widget to Grid</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Catalog list */}
        <div className="p-4 max-h-[350px] overflow-y-auto space-y-2">
          {AVAILABLE_WIDGET_CATALOG.map((item) => (
            <div
              key={`${item.type}-${item.metric}`}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70 transition duration-150 group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-500">
                  Type: <span className="font-mono">{item.type}</span> | Data metric:{" "}
                  <span className="font-mono">{item.metric}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  onAdd(item.type, item.metric, item.title);
                  onClose();
                }}
                className="flex items-center gap-1 text-xs font-semibold rounded-lg bg-indigo-600/10 hover:bg-indigo-600 hover:text-slate-100 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 p-3 bg-slate-950/20 text-[10px] text-slate-500 text-center rounded-b-2xl">
          Widgets are appended to the grid and can be dragged or resized dynamically.
        </div>
      </div>
    </div>
  );
}
