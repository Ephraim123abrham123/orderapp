"""
Database initialization and data seeding script.
Generates schema tables if missing and seeds initial default users, dashboard configs, and mock orders.
"""
import asyncio
import decimal
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import async_session_maker, engine
from app.models.base import Base
from app.models.user import User
from app.models.order import Order
from app.models.dashboard_config import DashboardConfig
from app.core.security import get_password_hash
from app.core.logging import logger

SEED_USER_USERNAME = "admin"
SEED_USER_PASSWORD = "admin"

SEED_ORDERS = [
    {"customer_name": "John Doe", "amount": 500.00, "currency": "USD", "usd_amount": 500.00, "status": "Pending", "days_ago": 10},
    {"customer_name": "Alice Smith", "amount": 350.00, "currency": "EUR", "usd_amount": 380.00, "status": "Processing", "days_ago": 9},
    {"customer_name": "Bob Johnson", "amount": 120.00, "currency": "GBP", "usd_amount": 155.00, "status": "Completed", "days_ago": 8},
    {"customer_name": "Charlie Brown", "amount": 950.00, "currency": "USD", "usd_amount": 950.00, "status": "Completed", "days_ago": 7},
    {"customer_name": "Diana Prince", "amount": 1500.00, "currency": "EUR", "usd_amount": 1630.00, "status": "Processing", "days_ago": 6},
    {"customer_name": "Evan Wright", "amount": 75.00, "currency": "USD", "usd_amount": 75.00, "status": "Cancelled", "days_ago": 5},
    {"customer_name": "Fiona Gallagher", "amount": 430.00, "currency": "GBP", "usd_amount": 555.00, "status": "Pending", "days_ago": 5},
    {"customer_name": "George Bluth", "amount": 12000.00, "currency": "USD", "usd_amount": 12000.00, "status": "Completed", "days_ago": 4},
    {"customer_name": "Hannah Baker", "amount": 220.00, "currency": "EUR", "usd_amount": 240.00, "status": "Completed", "days_ago": 4},
    {"customer_name": "Ian Malcolm", "amount": 880.00, "currency": "USD", "usd_amount": 880.00, "status": "Processing", "days_ago": 3},
    {"customer_name": "Julia Roberts", "amount": 310.00, "currency": "GBP", "usd_amount": 400.00, "status": "Pending", "days_ago": 3},
    {"customer_name": "Kevin Bacon", "amount": 640.00, "currency": "USD", "usd_amount": 640.00, "status": "Completed", "days_ago": 2},
    {"customer_name": "Laura Croft", "amount": 1250.00, "currency": "EUR", "usd_amount": 1360.00, "status": "Processing", "days_ago": 2},
    {"customer_name": "Michael Scott", "amount": 150.00, "currency": "USD", "usd_amount": 150.00, "status": "Cancelled", "days_ago": 1},
    {"customer_name": "Nancy Drew", "amount": 340.00, "currency": "USD", "usd_amount": 340.00, "status": "Completed", "days_ago": 1},
    {"customer_name": "Oscar Martinez", "amount": 90.00, "currency": "EUR", "usd_amount": 98.00, "status": "Pending", "days_ago": 0},
    {"customer_name": "Pam Beesly", "amount": 410.00, "currency": "USD", "usd_amount": 410.00, "status": "Processing", "days_ago": 0},
    {"customer_name": "Quentin Tarantino", "amount": 2500.00, "currency": "GBP", "usd_amount": 3225.00, "status": "Completed", "days_ago": 0},
    {"customer_name": "Rachel Green", "amount": 180.00, "currency": "USD", "usd_amount": 180.00, "status": "Pending", "days_ago": 0},
    {"customer_name": "Steve Rogers", "amount": 750.00, "currency": "EUR", "usd_amount": 815.00, "status": "Completed", "days_ago": 0},
]


async def init_db() -> None:
    """
    Creates tables via SQLAlchemy metadata if they do not exist,
    then seeds default users and initial mock order listings.
    """
    async with engine.begin() as conn:
        logger.info("Initializing database tables...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")

    async with async_session_maker() as session:
        user_result = await session.execute(
            select(User).where(User.username == SEED_USER_USERNAME)
        )
        user = user_result.scalar_one_or_none()

        if not user:
            logger.info(f"Creating default user: {SEED_USER_USERNAME}...")
            user = User(
                username=SEED_USER_USERNAME,
                hashed_password=get_password_hash(SEED_USER_PASSWORD)
            )
            session.add(user)
            await session.flush()
            
            default_layout = [
                {"i": "kpi-revenue", "x": 0, "y": 0, "w": 4, "h": 2, "type": "kpi", "title": "Total Revenue (USD)", "metric": "total_revenue"},
                {"i": "kpi-orders", "x": 4, "y": 0, "w": 4, "h": 2, "type": "kpi", "title": "Total Orders", "metric": "total_orders"},
                {"i": "kpi-avg-value", "x": 8, "y": 0, "w": 4, "h": 2, "type": "kpi", "title": "Avg Order Value (USD)", "metric": "avg_order_value"},
                {"i": "chart-status", "x": 0, "y": 2, "w": 6, "h": 4, "type": "status_pie", "title": "Orders Status Breakdown", "metric": "status_breakdown"},
                {"i": "chart-trend", "x": 6, "y": 2, "w": 6, "h": 4, "type": "revenue_trend", "title": "Revenue Trend (Daily)", "metric": "revenue_trend"},
                {"i": "table-customers", "x": 0, "y": 6, "w": 12, "h": 4, "type": "top_customers", "title": "Top Customers by Volume", "metric": "top_customers"},
            ]
            config = DashboardConfig(
                user_id=user.id,
                layout_json={"widgets": default_layout}
            )
            session.add(config)
            logger.info("Default user and dashboard config created.")
        else:
            user.hashed_password = get_password_hash(SEED_USER_PASSWORD)
            session.add(user)
            logger.info("Default user password updated to match seed settings.")

        order_result = await session.execute(select(Order).limit(1))
        has_orders = order_result.scalar() is not None

        if not has_orders:
            logger.info("Seeding initial order database...")
            now = datetime.now(timezone.utc)
            
            for o in SEED_ORDERS:
                created_time = now - timedelta(days=o["days_ago"])
                order = Order(
                    customer_name=o["customer_name"],
                    amount=decimal.Decimal(str(o["amount"])),
                    currency=o["currency"],
                    usd_amount=decimal.Decimal(str(o["usd_amount"])),
                    status=o["status"],
                    created_at=created_time,
                    updated_at=created_time
                )
                session.add(order)
            logger.info("Initial orders seeded.")
        else:
            logger.info("Orders database already seeded.")

        await session.commit()


if __name__ == "__main__":
    logging_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    import logging
    logging.basicConfig(level=logging.INFO, format=logging_format)
    asyncio.run(init_db())
