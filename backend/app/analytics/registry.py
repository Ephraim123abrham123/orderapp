from typing import Dict, Any, List
from app.analytics.revenue_trend import RevenueTrendCalculator
from app.analytics.status_breakdown import StatusBreakdownCalculator
from app.analytics.top_customers import TopCustomersCalculator
from app.models.order import Order


class MetricRegistry:
    """Registry mapping widget metrics to their calculation classes"""
    
    def __init__(self):
        self._calculators = {
            "revenue_trend": RevenueTrendCalculator(),
            "status_breakdown": StatusBreakdownCalculator(),
            "top_customers": TopCustomersCalculator()
        }

    def get_calculator(self, metric_name: str):
        return self._calculators.get(metric_name)

    def calculate_all(self, orders: List[Order]) -> Dict[str, Any]:
        """Calculates global KPIs and delegates widget-specific metrics to registered calculators"""
        results = {}
        
        # Filter gross metrics: total revenue and averages exclude Cancelled orders
        revenue_orders = [o for o in orders if o.status != "Cancelled"]
        
        total_orders = len(orders)
        total_revenue = sum(float(o.usd_amount) for o in revenue_orders)
        avg_value = total_revenue / len(revenue_orders) if len(revenue_orders) > 0 else 0.0

        results["total_orders"] = total_orders
        results["total_revenue"] = round(total_revenue, 2)
        results["avg_order_value"] = round(avg_value, 2)

        # Delegate custom chart metric calculations
        for name, calculator in self._calculators.items():
            results[name] = calculator.calculate(orders)

        return results


registry = MetricRegistry()
