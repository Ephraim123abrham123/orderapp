from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dashboard_config import DashboardConfig
from typing import Optional


class DashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_id(self, user_id: int) -> Optional[DashboardConfig]:
        result = await self.db.execute(
            select(DashboardConfig).where(DashboardConfig.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_or_update(self, user_id: int, layout_json: dict) -> DashboardConfig:
        config = await self.get_by_user_id(user_id)
        if config:
            config.layout_json = layout_json
        else:
            config = DashboardConfig(user_id=user_id, layout_json=layout_json)
            self.db.add(config)
        await self.db.flush()
        await self.db.refresh(config)
        return config
