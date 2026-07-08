from fastapi import APIRouter
from app.api.v1.endpoints import auth, orders, bulk_import, analytics, websocket

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(bulk_import.router, prefix="/orders", tags=["Bulk Import"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
