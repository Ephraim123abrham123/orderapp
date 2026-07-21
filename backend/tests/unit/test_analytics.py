import pytest
from datetime import datetime, timezone, timedelta
import decimal

from app.models.order import Order
from app.analytics.status_breakdown import StatusBreakdownCalculator
from app.analytics.revenue_trend import RevenueTrendCalculator
from app.analytics.registry import registry
from app.services.analytics_service import AnalyticsService

@pytest.fixture
def mock_orders():
    # Setup some test orders with specific dates, statuses, and amounts
    base_time = datetime(2026, 7, 20, 12, 0, 0, tzinfo=timezone.utc)
    return [
        Order(
            id=1, customer_name="Customer A", amount=decimal.Decimal("100.00"), currency="USD",
            usd_amount=decimal.Decimal("100.00"), status="Completed",
            created_at=base_time, updated_at=base_time
        ),
        Order(
            id=2, customer_name="Customer B", amount=decimal.Decimal("200.00"), currency="EUR",
            usd_amount=decimal.Decimal("220.00"), status="Processing",
            created_at=base_time, updated_at=base_time
        ),
        Order(
            id=3, customer_name="Customer C", amount=decimal.Decimal("50.00"), currency="USD",
            usd_amount=decimal.Decimal("50.00"), status="Cancelled",
            created_at=base_time - timedelta(days=1), updated_at=base_time - timedelta(days=1)
        ),
        Order(
            id=4, customer_name="Customer A", amount=decimal.Decimal("300.00"), currency="GBP",
            usd_amount=decimal.Decimal("390.00"), status="Completed",
            created_at=base_time - timedelta(days=1), updated_at=base_time - timedelta(days=1)
        ),
        Order(
            id=5, customer_name="Customer D", amount=decimal.Decimal("150.00"), currency="USD",
            usd_amount=decimal.Decimal("150.00"), status="Pending",
            created_at=base_time, updated_at=base_time
        )
    ]

def test_status_breakdown_calculator(mock_orders):
    calculator = StatusBreakdownCalculator()
    result = calculator.calculate(mock_orders)
    
    # We should have counts and values mapped for all four statuses
    assert len(result) == 4
    
    status_map = {item["status"]: item for item in result}
    
    assert status_map["Completed"]["count"] == 2
    assert status_map["Completed"]["value"] == 490.00 # 100.00 + 390.00
    
    assert status_map["Processing"]["count"] == 1
    assert status_map["Processing"]["value"] == 220.00
    
    assert status_map["Cancelled"]["count"] == 1
    assert status_map["Cancelled"]["value"] == 50.00
    
    assert status_map["Pending"]["count"] == 1
    assert status_map["Pending"]["value"] == 150.00

def test_revenue_trend_calculator(mock_orders):
    calculator = RevenueTrendCalculator()
    result = calculator.calculate(mock_orders)
    
    # Should yield data grouped by dates sorted chronologically
    # Date 2026-07-19: should contain order 4 (completed 390.00). Note: order 3 is cancelled, so skipped.
    # Date 2026-07-20: should contain orders 1 (completed 100.00), 2 (processing 220.00), 5 (pending 150.00) = 470.00
    assert len(result) == 2
    
    assert result[0]["date"] == "2026-07-19"
    assert result[0]["revenue"] == 390.00
    
    assert result[1]["date"] == "2026-07-20"
    assert result[1]["revenue"] == 470.00

def test_metric_registry_calculate_all(mock_orders):
    results = registry.calculate_all(mock_orders)
    
    # Exclude Cancelled (order 3, usd_amount=50) for total revenue calculations
    # Total revenue orders = 1, 2, 4, 5
    # Sum: 100 + 220 + 390 + 150 = 860.00
    # Avg: 860 / 4 = 215.00
    assert results["total_orders"] == 5
    assert results["total_revenue"] == 860.00
    assert results["avg_order_value"] == 215.00
    
    # Custom charts calculations delegated
    assert "revenue_trend" in results
    assert "status_breakdown" in results
    assert "top_customers" in results
