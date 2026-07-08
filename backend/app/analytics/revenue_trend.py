from typing import List, Dict, Any
from collections import defaultdict
from app.analytics.base import MetricCalculator
from app.models.order import Order


class RevenueTrendCalculator(MetricCalculator):
    """Computes daily totals for order values in USD for line charts"""
    
    def calculate(self, orders: List[Order]) -> List[Dict[str, Any]]:
        daily_revenue = defaultdict(float)
        
        for order in orders:
            # Skip cancelled orders when computing revenue trends if appropriate,
            # but let's include completed/processing/pending, maybe excluding cancelled.
            # Let's count all except 'Cancelled' to represent gross order value,
            # or just count all orders. Let's exclude 'Cancelled' to be more realistic.
            if order.status == "Cancelled":
                continue
                
            date_str = order.created_at.strftime("%Y-%m-%d")
            daily_revenue[date_str] += float(order.usd_amount)
            
        # Format as list of dicts and sort chronologically
        sorted_trend = sorted(
            [{"date": dt, "revenue": round(rev, 2)} for dt, rev in daily_revenue.items()],
            key=lambda x: x["date"]
        )
        
        # Return at most last 30 days to keep chart tidy
        return sorted_trend[-30:]
