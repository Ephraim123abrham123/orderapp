"use client";

import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import { WidgetConfig } from "@/hooks/useAnalytics";
import { WIDGET_REGISTRY } from "./WidgetRegistry";
import WidgetShell from "./WidgetShell";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  widgets: WidgetConfig[];
  metrics: any;
  onLayoutChange: (newLayouts: any[]) => void;
  onRemoveWidget: (widgetId: string) => void;
}

export default function DashboardGrid({
  widgets,
  metrics,
  onLayoutChange,
  onRemoveWidget,
}: DashboardGridProps) {
  
  // Format current widgets config into react-grid-layout compatible layouts object
  const gridLayout = widgets.map((w) => ({
    i: w.i,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
  }));

  const handleLayoutChange = (currentLayout: any[]) => {
    // Check if anything actually changed in dimensions/coordinates
    const updated = widgets.map((w) => {
      const match = currentLayout.find((item) => item.i === w.i);
      if (match) {
        return {
          ...w,
          x: match.x,
          y: match.y,
          w: match.w,
          h: match.h,
        };
      }
      return w;
    });
    
    onLayoutChange(updated);
  };

  const renderWidgetContent = (w: WidgetConfig) => {
    const Component = WIDGET_REGISTRY[w.type];
    if (!Component) {
      return (
        <div className="flex h-full items-center justify-center text-xs text-rose-500">
          Widget type not registered.
        </div>
      );
    }

    // Extract value or data mapping
    const value = metrics ? metrics[w.metric] : null;

    if (w.type === "kpi") {
      return <Component title={w.title} value={value ?? 0} metric={w.metric} />;
    }

    return <Component data={value || []} />;
  };

  return (
    <div className="relative -mx-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: gridLayout, md: gridLayout, sm: gridLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 12, sm: 6 }}
        rowHeight={80}
        draggableHandle=".drag-handle"
        onLayoutChange={handleLayoutChange}
        margin={[16, 16]}
        isDraggable={true}
        isResizable={true}
      >
        {widgets.map((w) => (
          <div key={w.i} data-grid={{ x: w.x, y: w.y, w: w.w, h: w.h, minW: 2, minH: 2 }}>
            <WidgetShell title={w.title} onRemove={() => onRemoveWidget(w.i)}>
              {renderWidgetContent(w)}
            </WidgetShell>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
