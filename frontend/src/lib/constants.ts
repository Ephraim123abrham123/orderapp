export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== "undefined" 
    ? `http://${window.location.hostname}:8000/api/v1` 
    : "http://localhost:8000/api/v1");

export const WS_BASE_URL = 
  process.env.NEXT_PUBLIC_WS_URL || 
  (typeof window !== "undefined" 
    ? `ws://${window.location.hostname}:8000/api/v1/ws` 
    : "ws://localhost:8000/api/v1/ws");

export const ORDER_STATUSES = ["Pending", "Processing", "Completed", "Cancelled"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

export const WIDGET_TYPES = {
  KPI: "kpi",
  REVENUE_TREND: "revenue_trend",
  STATUS_PIE: "status_pie",
  TOP_CUSTOMERS: "top_customers",
} as const;
