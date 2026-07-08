import KpiCardWidget from "./widgets/KpiCardWidget";
import RevenueTrendWidget from "./widgets/RevenueTrendWidget";
import StatusBreakdownWidget from "./widgets/StatusBreakdownWidget";
import TopCustomersWidget from "./widgets/TopCustomersWidget";

export const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
  kpi: KpiCardWidget,
  revenue_trend: RevenueTrendWidget,
  status_pie: StatusBreakdownWidget,
  top_customers: TopCustomersWidget,
};

// Available metrics and matching default widget specs for manual layouts additions
export const AVAILABLE_WIDGET_CATALOG = [
  { type: "kpi", metric: "total_revenue", title: "Total Revenue (USD)" },
  { type: "kpi", metric: "total_orders", title: "Total Orders" },
  { type: "kpi", metric: "avg_order_value", title: "Avg Order Value (USD)" },
  { type: "revenue_trend", metric: "revenue_trend", title: "Daily Sales Trend" },
  { type: "status_pie", metric: "status_breakdown", title: "Status Share Breakdown" },
  { type: "top_customers", metric: "top_customers", title: "Top Customers by Volume" },
];
