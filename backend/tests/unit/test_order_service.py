import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

from app.services.order_service import OrderService
from app.schemas.order import OrderCreate
from app.models.order import Order
from app.core.exceptions import EntityNotFoundException

@pytest.mark.asyncio
async def test_create_order_success(db_session, mocker):
    # Mock repositories and adapters
    mock_convert = mocker.patch("app.adapters.external_api.exchange_rate_adapter.ExchangeRateAdapter.convert_to_usd", new_callable=AsyncMock)
    mock_convert.return_value = Decimal("545.00")
    
    mock_broadcast = mocker.patch("app.adapters.notifications.websocket_adapter.WebSocketNotificationAdapter.broadcast_order_status_change", new_callable=AsyncMock)
    
    order_data = OrderCreate(
        customer_name="Test Customer",
        amount=Decimal("500.00"),
        currency="EUR",
        status="Pending"
    )
    
    service = OrderService(db_session)
    created_order = await service.create_order(order_data)
    
    # Assert database insertion
    assert created_order.id is not None
    assert created_order.customer_name == "Test Customer"
    assert created_order.amount == Decimal("500.00")
    assert created_order.currency == "EUR"
    assert created_order.usd_amount == Decimal("545.00")
    assert created_order.status == "Pending"
    
    # Assert exchange rate converter was called
    mock_convert.assert_called_once_with(Decimal("500.00"), "EUR")
    
    # Assert notification was broadcasted
    mock_broadcast.assert_called_once()
    broadcast_call_args = mock_broadcast.call_args[1]
    assert broadcast_call_args["order_id"] == created_order.id
    assert broadcast_call_args["old_status"] == "None"
    assert broadcast_call_args["new_status"] == "Pending"

@pytest.mark.asyncio
async def test_update_order_status_success(db_session, mocker):
    mock_broadcast = mocker.patch("app.adapters.notifications.websocket_adapter.WebSocketNotificationAdapter.broadcast_order_status_change", new_callable=AsyncMock)
    
    # Pre-insert an order
    order = Order(
        customer_name="John Doe",
        amount=Decimal("100.00"),
        currency="USD",
        usd_amount=Decimal("100.00"),
        status="Pending"
    )
    db_session.add(order)
    await db_session.commit()
    
    service = OrderService(db_session)
    updated_order = await service.update_order_status(order.id, "Processing")
    
    # Assert state changed
    assert updated_order.status == "Processing"
    
    # Assert notification was broadcasted with old and new status
    mock_broadcast.assert_called_once()
    broadcast_call_args = mock_broadcast.call_args[1]
    assert broadcast_call_args["order_id"] == order.id
    assert broadcast_call_args["old_status"] == "Pending"
    assert broadcast_call_args["new_status"] == "Processing"

@pytest.mark.asyncio
async def test_update_order_status_no_change(db_session, mocker):
    mock_broadcast = mocker.patch("app.adapters.notifications.websocket_adapter.WebSocketNotificationAdapter.broadcast_order_status_change", new_callable=AsyncMock)
    
    # Pre-insert an order
    order = Order(
        customer_name="John Doe",
        amount=Decimal("100.00"),
        currency="USD",
        usd_amount=Decimal("100.00"),
        status="Completed"
    )
    db_session.add(order)
    await db_session.commit()
    
    service = OrderService(db_session)
    # Update to same status
    updated_order = await service.update_order_status(order.id, "Completed")
    
    assert updated_order.status == "Completed"
    # Broadcast should NOT be called since status was already completed
    mock_broadcast.assert_not_called()

@pytest.mark.asyncio
async def test_update_order_status_not_found(db_session):
    service = OrderService(db_session)
    with pytest.raises(EntityNotFoundException):
        await service.update_order_status(9999, "Completed")
