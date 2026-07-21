import pytest
import pytest_asyncio
import decimal
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import AsyncMock

from app.main import app
from app.db.session import get_db
from app.models.user import User
from app.models.order import Order
from app.core.security import get_password_hash, create_access_token

@pytest_asyncio.fixture
async def authenticated_client(db_session, mocker) -> AsyncClient:
    # 1. Create a test user in DB
    user = User(
        username="test_api_user",
        hashed_password=get_password_hash("testpassword")
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    # 2. Override get_db dependency to yield the current transactional session
    async def override_get_db():
        yield db_session
        
    app.dependency_overrides[get_db] = override_get_db
    
    # 3. Create token and headers
    token = create_access_token(subject=user.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 4. Mock notification and currency adapter to avoid external hits
    mocker.patch("app.adapters.notifications.websocket_adapter.WebSocketNotificationAdapter.broadcast_order_status_change", new_callable=AsyncMock)
    mocker.patch("app.adapters.external_api.exchange_rate_adapter.ExchangeRateAdapter.convert_to_usd", new_callable=AsyncMock, return_value=decimal.Decimal("120.00"))
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as client:
        yield client
        
    # Clean up overrides
    app.dependency_overrides.pop(get_db, None)

@pytest.mark.asyncio
async def test_api_create_order(authenticated_client, db_session):
    payload = {
        "customer_name": "API Customer",
        "amount": 100.00,
        "currency": "EUR",
        "status": "Pending"
    }
    
    response = await authenticated_client.post("/api/v1/orders", json=payload)
    
    assert response.status_code == 201
    data = response.json()
    assert data["customer_name"] == "API Customer"
    assert data["amount"] == "100.00"
    assert data["usd_amount"] == "120.00" # mocked convert return value
    assert data["status"] == "Pending"
    assert "id" in data

@pytest.mark.asyncio
async def test_api_list_orders(authenticated_client, db_session):
    # Pre-populate orders
    order1 = Order(
        customer_name="Customer X", amount=decimal.Decimal("50.00"), currency="USD",
        usd_amount=decimal.Decimal("50.00"), status="Completed"
    )
    order2 = Order(
        customer_name="Customer Y", amount=decimal.Decimal("80.00"), currency="USD",
        usd_amount=decimal.Decimal("80.00"), status="Processing"
    )
    db_session.add(order1)
    db_session.add(order2)
    await db_session.commit()
    
    response = await authenticated_client.get("/api/v1/orders")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    assert data["items"][0]["customer_name"] == "Customer Y" # sorted desc by created_at default
    assert data["items"][1]["customer_name"] == "Customer X"
