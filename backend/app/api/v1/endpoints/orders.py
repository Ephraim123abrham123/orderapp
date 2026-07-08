from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut, OrderUpdateStatus, OrderListResponse
from app.services.order_service import OrderService

router = APIRouter()


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Create a new order and broadcast creation status"""
    order_service = OrderService(db)
    return await order_service.create_order(order_in)


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by customer name"),
    status: Optional[str] = Query(None, description="Filter by status (Pending, Processing, Completed, Cancelled)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Retrieve list of orders with filters and pagination"""
    order_service = OrderService(db)
    skip = (page - 1) * size
    items, total = await order_service.get_order_list(
        skip=skip,
        limit=size,
        search=search,
        status=status
    )
    return OrderListResponse(items=items, total=total, page=page, size=size)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order_details(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get single order details by ID"""
    order_service = OrderService(db)
    return await order_service.get_order_by_id(order_id)


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    status_update: OrderUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update order status and broadcast change instantly via WebSockets"""
    order_service = OrderService(db)
    return await order_service.update_order_status(order_id, status_update.status)
