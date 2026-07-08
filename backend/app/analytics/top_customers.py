from typing import List, Dict, Any
from collections import defaultdict
from app.analytics.base import MetricCalculator
from app.models.order import Order


class TopCustomersCalculator(MetricCalculator):
    """Identifies customer spenders by summing order USD values and volumes"""
    
    def calculate(self, orders: List[Order]) -> List[Dict[str, Any]]:
        customer_revenue = defaultdict(float)
        customer_orders = defaultdict(int)
        
        for order in orders:
            if order.status == "Cancelled":
                continue
            name = order.customer_name
            customer_revenue[name] += float(order.usd_amount)
            customer_orders[name] += 1
            
        customers = []
        for name in customer_revenue:
            customers.append({
                "customer_name": name,
                "revenue": round(customer_revenue[name], 2),
                "orders_count": customer_orders[name]
            })
            
        # Sort by revenue descending, take top 10
        sorted_customers = sorted(customers, key=lambda x: x["revenue"], reverse=True)
        return sorted_customers[:10]
