from app.adapters.notifications.base import NotificationPort
from app.websocket.connection_manager import manager


class WebSocketNotificationAdapter(NotificationPort):
    """Concrete implementation of NotificationPort broadcasting via WebSockets"""
    
    async def broadcast_order_status_change(
        self, order_id: int, old_status: str, new_status: str, order_data: dict
    ) -> None:
        await manager.broadcast({
            "event": "order_status_changed",
            "data": {
                "order_id": order_id,
                "old_status": old_status,
                "new_status": new_status,
                "order": order_data
            }
        })

    async def broadcast_import_progress(
        self, job_id: str, success_count: int, failed_count: int, status: str
    ) -> None:
        await manager.broadcast({
            "event": "bulk_import_progress",
            "data": {
                "job_id": job_id,
                "success_count": success_count,
                "failed_count": failed_count,
                "status": status
            }
        })

    async def broadcast_import_complete(
        self, job_id: str, success_count: int, failed_count: int, error_log: list, status: str
    ) -> None:
        await manager.broadcast({
            "event": "bulk_import_complete",
            "data": {
                "job_id": job_id,
                "success_count": success_count,
                "failed_count": failed_count,
                "error_log": error_log,
                "status": status
            }
        })
