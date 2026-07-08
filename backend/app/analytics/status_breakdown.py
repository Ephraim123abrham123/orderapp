from typing import List, Dict, Any
from collections import defaultdict
from app.analytics.base import MetricCalculator
from app.models.order import Order


class StatusBreakdownCalculator(MetricCalculator):
    """Computes order counts and financial value grouped by status for pie/bar charts"""
    
    def calculate(self, orders: List[Order]) -> List[Dict[str, Any]]:
        counts = defaultdict(int)
        values = defaultdict(float)
        
        # Prepopulate keys so frontend gets complete datasets even if some statuses have 0 counts
        for status in ["Pending", "Processing", "Completed", "Cancelled"]:
            counts[status] = 0
            values[status] = 0.0

        for order in orders:
            counts[order.status] += 1
            values[order.status] += float(order.usd_amount)
            
        breakdown = []
        for status in counts:
            breakdown.append({
                "status": status,
                "count": counts[status],
                "value": round(values[status], 2)
            })
            
        return breakdown
