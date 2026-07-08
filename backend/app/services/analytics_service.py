from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.order_repository import OrderRepository
from app.repositories.dashboard_repository import DashboardRepository
from app.analytics.registry import registry
from typing import Dict, Any


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.order_repo = OrderRepository(db)
        self.dashboard_repo = DashboardRepository(db)

    async def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Loads orders and runs registry calculators to compute KPIs and charts"""
        # Fetch up to 100,000 orders to calculate metrics
        orders, _ = await self.order_repo.get_list(skip=0, limit=100000)
        return registry.calculate_all(orders)

    async def get_dashboard_layout(self, user_id: int) -> dict:
        """Retrieves custom dashboard widget layout for user"""
        config = await self.dashboard_repo.get_by_user_id(user_id)
        if config:
            return config.layout_json
        return {"widgets": []}

    async def save_dashboard_layout(self, user_id: int, layout_json: dict) -> dict:
        """Saves custom dashboard widget layout for user"""
        config = await self.dashboard_repo.create_or_update(user_id, layout_json)
        return config.layout_json
