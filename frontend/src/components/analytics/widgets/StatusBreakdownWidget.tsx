"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface StatusItem {
  status: string;
  count: number;
  value: number;
}

interface StatusBreakdownWidgetProps {
  data: StatusItem[];
}

const COLORS: Record<string, string> = {
  Pending: "#f59e0b",     // Amber
  Processing: "#6366f1",  // Indigo
  Completed: "#10b981",   // Emerald
  Cancelled: "#ef4444",   // Rose
};

export default function StatusBreakdownWidget({ data = [] }: StatusBreakdownWidgetProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Clean empty status sets
  const activeData = data.filter((item) => item.count > 0);

  if (activeData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-slate-500">
        No orders status records available.
      </div>
    );
  }

  return (
    <div className="h-full w-full pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="count"
            nameKey="status"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status] || "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.75rem",
              color: "#f8fafc",
              fontSize: "12px",
            }}
            formatter={(value: any, name: any, props: any) => {
              const item = props.payload;
              return [
                `${value} orders (${formatCurrency(item.value)})`,
                name,
              ];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={8}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-400 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
