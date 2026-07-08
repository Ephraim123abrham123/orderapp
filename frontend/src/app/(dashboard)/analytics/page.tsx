"use client";

import React, { useState } from "react";
import { useAnalytics, useDashboardLayout, WidgetConfig } from "@/hooks/useAnalytics";
import DashboardGrid from "@/components/analytics/DashboardGrid";
import AddWidgetModal from "@/components/analytics/AddWidgetModal";
import { Loader2, Plus, RotateCcw, Save } from "lucide-react";

export default function AnalyticsPage() {
  const { data: metricsData, isLoading: isMetricsLoading } = useAnalytics();
  const { layout, isLoading: isLayoutLoading, saveLayout, isSaving } = useDashboardLayout();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleLayoutChange = async (updatedWidgets: WidgetConfig[]) => {
    try {
      await saveLayout({ widgets: updatedWidgets });
    } catch (e) {
      console.error("Failed to persist layout", e);
    }
  };

  const handleAddWidget = async (type: string, metric: string, title: string) => {
    // Generate simple ID
    const newId = `widget-${Date.now()}`;
    
    // Position at coordinates: x=0, y=bottom of grid, with responsive size
    // Position at coordinates: x=0, y=bottom of grid, with responsive size
    const isKpi = type === "kpi";
    const maxY = layout.reduce((max, w) => Math.max(max, w.y + w.h), 0);
    
    const newWidget: WidgetConfig = {
      i: newId,
      x: 0,
      y: maxY, // appends at bottom
      w: isKpi ? 4 : 6,
      h: isKpi ? 2 : 4,
      type,
      title,
      metric,
    };

    const updated = [...layout, newWidget];
    await handleLayoutChange(updated);
  };

  const handleRemoveWidget = async (id: string) => {
    const updated = layout.filter((w) => w.i !== id);
    await handleLayoutChange(updated);
  };

  const handleResetLayout = async () => {
    const defaultWidgets: WidgetConfig[] = [
      { i: "kpi-revenue", x: 0, y: 0, w: 4, h: 2, type: "kpi", title: "Total Revenue (USD)", metric: "total_revenue" },
      { i: "kpi-orders", x: 4, y: 0, w: 4, h: 2, type: "kpi", title: "Total Orders", metric: "total_orders" },
      { i: "kpi-avg-value", x: 8, y: 0, w: 4, h: 2, type: "kpi", title: "Avg Order Value (USD)", metric: "avg_order_value" },
      { i: "chart-status", x: 0, y: 2, w: 6, h: 4, type: "status_pie", title: "Orders Status Breakdown", metric: "status_breakdown" },
      { i: "chart-trend", x: 6, y: 2, w: 6, h: 4, type: "revenue_trend", title: "Revenue Trend (Daily)", metric: "revenue_trend" },
      { i: "table-customers", x: 0, y: 6, w: 12, h: 4, type: "top_customers", title: "Top Customers by Volume", metric: "top_customers" },
    ];
    await handleLayoutChange(defaultWidgets);
  };

  const isLoading = isMetricsLoading || isLayoutLoading;

  return (
    <div className="space-y-6">
      {/* Top Toolbar panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/20 p-4 border border-slate-800 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Custom Analytics Grid</h1>
          <p className="text-xs text-slate-400">Drag or resize widgets to customize your layout dashboard.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset button */}
          <button
            onClick={handleResetLayout}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition cursor-pointer"
            title="Reset to default dashboard layout"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Layout</span>
          </button>

          {/* Add widget trigger */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] px-3.5 py-2 text-xs font-semibold text-slate-100 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Widget</span>
          </button>

          {/* Autosaving indicator badge */}
          {isSaving && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold px-2 py-1">
              <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
              <span>Saving layout...</span>
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-400">Loading custom analytics panels...</p>
          </div>
        </div>
      ) : (
        <DashboardGrid
          widgets={layout}
          metrics={metricsData?.metrics}
          onLayoutChange={handleLayoutChange}
          onRemoveWidget={handleRemoveWidget}
        />
      )}

      {/* Selector modal */}
      {showAddModal && (
        <AddWidgetModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWidget}
        />
      )}
    </div>
  );
}
