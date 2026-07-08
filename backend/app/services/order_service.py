import decimal
from typing import List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.order_repository import OrderRepository
from app.adapters.external_api.exchange_rate_adapter import ExchangeRateAdapter
from app.adapters.notifications.websocket_adapter import WebSocketNotificationAdapter
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderOut
from app.core.exceptions import EntityNotFoundException


class OrderService:
    def __init__(self, db: AsyncSession):
        self.order_repo = OrderRepository(db)
        self.exchange_adapter = ExchangeRateAdapter()
        self.notifier = WebSocketNotificationAdapter()

    async def get_order_by_id(self, order_id: int) -> Order:
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise EntityNotFoundException("Order", order_id)
        return order

    async def get_order_list(
        self,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[List[Order], int]:
        return await self.order_repo.get_list(skip, limit, search, status)

    async def create_order(self, order_data: OrderCreate) -> Order:
        # Calculate USD amount using external ExchangeRateAdapter
        usd_amount = await self.exchange_adapter.convert_to_usd(
            order_data.amount, 
            order_data.currency or "USD"
        )
        
        order = Order(
            customer_name=order_data.customer_name,
            amount=order_data.amount,
            currency=order_data.currency or "USD",
            usd_amount=usd_amount,
            status=order_data.status or "Pending"
        )
        
        created_order = await self.order_repo.create(order)
        
        # Serialize for WebSocket notification
        serialized_order = OrderOut.model_validate(created_order).model_dump(mode="json")
        await self.notifier.broadcast_order_status_change(
            order_id=created_order.id,
            old_status="None",
            new_status=created_order.status,
            order_data=serialized_order
        )
        
        return created_order

    async def update_order_status(self, order_id: int, new_status: str) -> Order:
        order = await self.get_order_by_id(order_id)
        old_status = order.status
        
        if old_status == new_status:
            return order
            
        order.status = new_status
        updated_order = await self.order_repo.update(order)
        
        # Serialize for WebSocket notification
        serialized_order = OrderOut.model_validate(updated_order).model_dump(mode="json")
        await self.notifier.broadcast_order_status_change(
            order_id=updated_order.id,
            old_status=old_status,
            new_status=new_status,
            order_data=serialized_order
        )
        
        return updated_order
