"use client";

import React from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import KpiCardWidget from "@/components/analytics/widgets/KpiCardWidget";
import RevenueTrendWidget from "@/components/analytics/widgets/RevenueTrendWidget";
import StatusBreakdownWidget from "@/components/analytics/widgets/StatusBreakdownWidget";
import TopCustomersWidget from "@/components/analytics/widgets/TopCustomersWidget";
import AuditLogPanel from "@/components/analytics/AuditLogPanel";
import { Loader2, TrendingUp, DollarSign, ShoppingBag, PieChart as PieIcon, Award } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_orders: 0,
    total_revenue: 0.0,
    avg_order_value: 0.0,
    status_breakdown: [],
    revenue_trend: [],
    top_customers: [],
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Welcome to your Dashboard</h1>
          <p className="text-sm text-slate-400">Here is the real-time summary of your sales and operations.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-slate-800 rounded-2xl bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-indigo-500/5 group-hover:scale-110 transition duration-300">
            <DollarSign className="h-24 w-24" />
          </div>
          <KpiCardWidget
            title="Total Revenue (USD)"
            value={metrics.total_revenue}
            subtitle="Gross sales excluding cancelled orders"
            metric="total_revenue"
          />
        </div>

        <div className="border border-slate-800 rounded-2xl bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-emerald-500/5 group-hover:scale-110 transition duration-300">
            <ShoppingBag className="h-24 w-24" />
          </div>
          <KpiCardWidget
            title="Total Orders"
            value={metrics.total_orders}
            subtitle="Total orders processed in system"
            metric="total_orders"
          />
        </div>

        <div className="border border-slate-800 rounded-2xl bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-amber-500/5 group-hover:scale-110 transition duration-300">
            <TrendingUp className="h-24 w-24" />
          </div>
          <KpiCardWidget
            title="Avg Order Value"
            value={metrics.avg_order_value}
            subtitle="Average revenue size per order"
            metric="avg_order_value"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Daily Revenue Area Trend */}
        <div className="lg:col-span-8 border border-slate-800 rounded-2xl bg-slate-900/40 p-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2 mb-4">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Daily Revenue Trend (USD)</h3>
          </div>
          <div className="h-72">
            <RevenueTrendWidget data={metrics.revenue_trend} />
          </div>
        </div>

        {/* Status Share breakdown */}
        <div className="lg:col-span-4 border border-slate-800 rounded-2xl bg-slate-900/40 p-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2 mb-4">
            <PieIcon className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Status Volume Share</h3>
          </div>
          <div className="h-72">
            <StatusBreakdownWidget data={metrics.status_breakdown} />
          </div>
        </div>
      </div>

      {/* Rankings Grid & Audit logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 border border-slate-800 rounded-2xl bg-slate-900/40 p-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2 mb-4">
            <Award className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Top Performing Customers</h3>
          </div>
          <div className="h-64">
            <TopCustomersWidget data={metrics.top_customers} />
          </div>
        </div>

        <div className="lg:col-span-6">
          <AuditLogPanel />
        </div>
      </div>
    </div>
  );
}
