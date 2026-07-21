from typing import List, Dict, Any
from pydantic import BaseModel


class WidgetConfigSchema(BaseModel):
    i: str
    x: int
    y: int
    w: int
    h: int
    type: str  # e.g. "kpi", "revenue_trend", "status_pie", "top_customers"
    title: str
    metric: str  # e.g. "total_revenue", "total_orders", "avg_order_value", "status_breakdown"


class DashboardLayoutSchema(BaseModel):
    widgets: List[WidgetConfigSchema]


class MetricResponse(BaseModel):
    # Dict mapping metric name to its computed value (which can be float, dict, or list)
    metrics: Dict[str, Any]
