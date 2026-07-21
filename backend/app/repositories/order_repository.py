from typing import List, Tuple, Optional
from sqlalchemy import select, func, insert
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, order_id: int) -> Optional[Order]:
        result = await self.db.execute(
            select(Order).where(Order.id == order_id)
        )
        return result.scalar_one_or_none()

    async def get_list(
        self,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[List[Order], int]:
        query = select(Order)
        
        # Filtering by status
        if status:
            query = query.where(Order.status == status)
            
        # Searching by customer name
        if search:
            query = query.where(Order.customer_name.ilike(f"%{search}%"))
            
        # Count total items matching criteria
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await self.db.execute(count_query)
        total_count = count_result.scalar_one()
        
        # Pagination & sorting by created_at desc
        query = query.order_by(Order.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        
        return items, total_count

    async def create(self, order: Order) -> Order:
        self.db.add(order)
        await self.db.flush()
        await self.db.refresh(order)
        return order

    async def update(self, order: Order) -> Order:
        self.db.add(order)
        await self.db.flush()
        await self.db.refresh(order)
        return order

    async def bulk_insert(self, orders: List[dict]) -> None:
        """Fast bulk insert of raw dictionary mappings using INSERT...VALUES executemany"""
        if not orders:
            return
        await self.db.execute(insert(Order), orders)
        await self.db.flush()
