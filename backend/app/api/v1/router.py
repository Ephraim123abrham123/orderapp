from fastapi import APIRouter
from app.api.v1.endpoints import auth, orders, bulk_import, analytics, websocket, audit_log

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(bulk_import.router, prefix="/orders", tags=["bulk-import"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(audit_log.router, prefix="/audit-log", tags=["audit-log"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])
