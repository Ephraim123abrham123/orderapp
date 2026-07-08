import React from "react";

interface KpiCardWidgetProps {
  title: string;
  value: number | string;
  subtitle?: string;
  metric: string;
}

export default function KpiCardWidget({ title, value, subtitle, metric }: KpiCardWidgetProps) {
  // Format based on metric type
  const isCurrency = metric === "total_revenue" || metric === "avg_order_value";
  
  let formattedValue = String(value);
  if (isCurrency && typeof value === "number") {
    formattedValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  } else if (typeof value === "number") {
    formattedValue = new Intl.NumberFormat("en-US").format(value);
  }

  return (
    <div className="flex h-full flex-col justify-between p-4 bg-slate-900/40 rounded-xl">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {title}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-slate-100 bg-gradient-to-r from-indigo-300 to-slate-100 bg-clip-text text-transparent">
        {formattedValue}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">
        {subtitle || "Real-time computed metric"}
      </div>
    </div>
  );
}
