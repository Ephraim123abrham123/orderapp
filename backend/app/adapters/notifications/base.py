from abc import ABC, abstractmethod


class NotificationPort(ABC):
    """Abstract port for broadcasting system notifications to users"""
    
    @abstractmethod
    async def broadcast_order_status_change(
        self, order_id: int, old_status: str, new_status: str, order_data: dict
    ) -> None:
        """Broadcasts real-time order status transition events"""
        pass

    @abstractmethod
    async def broadcast_import_progress(
        self, job_id: str, success_count: int, failed_count: int, status: str
    ) -> None:
        """Broadcasts progress indicators during long-running bulk imports"""
        pass

    @abstractmethod
    async def broadcast_import_complete(
        self, job_id: str, success_count: int, failed_count: int, error_log: list, status: str
    ) -> None:
        """Broadcasts completion status along with failure logs for bulk imports"""
        pass
