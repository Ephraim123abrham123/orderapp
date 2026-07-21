import pytest
import decimal
from unittest.mock import AsyncMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.db.session import get_db
from app.models.user import User
from app.models.order import Order
from app.models.audit_log import AuditLog
from app.repositories.audit_log_repository import AuditLogRepository
from app.services.order_service import OrderService
from app.schemas.audit_log import AuditLogOut
from app.core.security import get_password_hash, create_access_token

@pytest.mark.asyncio
async def test_audit_log_repository_create_and_list(db_session):
    repo = AuditLogRepository(db_session)
    
    # 1. Create audit log
    log = AuditLog(
        entity_type="order",
        entity_id=10,
        action="status_change",
        old_value="Pending",
        new_value="Processing",
        changed_by=None
    )
    created_log = await repo.create(log)
    assert created_log.id is not None
    assert created_log.entity_id == 10
    assert created_log.old_value == "Pending"
    
    # 2. Query logs list
    items, total = await repo.get_list(entity_type="order")
    assert total == 1
    assert len(items) == 1
    assert items[0].id == created_log.id

@pytest.mark.asyncio
async def test_order_service_records_audit_log(db_session, mocker):
    mocker.patch("app.adapters.notifications.websocket_adapter.WebSocketNotificationAdapter.broadcast_order_status_change", new_callable=AsyncMock)
    mock_broadcast_audit = mocker.patch("app.adapters.notifications.websocket_adapter.WebSocketNotificationAdapter.broadcast_audit_log_created", new_callable=AsyncMock)
    
    # Create test user
    user = User(username="admin_user", hashed_password="pwd")
    db_session.add(user)
    
    # Create test order
    order = Order(
        customer_name="Test customer",
        amount=decimal.Decimal("10.00"),
        currency="USD",
        usd_amount=decimal.Decimal("10.00"),
        status="Pending"
    )
    db_session.add(order)
    await db_session.commit()
    
    # Update status triggering service audit
    service = OrderService(db_session)
    await service.update_order_status(order.id, "Completed", changed_by_user_id=user.id)
    
    # Assert database audit entry exists
    repo = AuditLogRepository(db_session)
    items, total = await repo.get_list(entity_type="order", entity_id=order.id)
    assert total == 1
    assert items[0].old_value == "Pending"
    assert items[0].new_value == "Completed"
    assert items[0].changed_by == user.id
    
    # Assert WebSocket broadcast triggered
    mock_broadcast_audit.assert_called_once()

@pytest.mark.asyncio
async def test_get_audit_logs_api(db_session, mocker):
    # Setup test user & token
    user = User(username="audit_reader", hashed_password=get_password_hash("pwd"))
    db_session.add(user)
    await db_session.commit()
    
    # Seed an audit log in DB
    log = AuditLog(
        entity_type="order",
        entity_id=5,
        action="status_change",
        old_value="Pending",
        new_value="Completed",
        changed_by=user.id
    )
    db_session.add(log)
    await db_session.commit()
    
    async def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    
    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as client:
        response = await client.get("/api/v1/audit-log")
        
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["entity_id"] == 5
    assert data["items"][0]["new_value"] == "Completed"
