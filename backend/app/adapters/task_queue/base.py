from abc import ABC, abstractmethod
from typing import Callable, Any


class TaskQueuePort(ABC):
    """Abstract port for scheduling asynchronous background tasks"""
    
    @abstractmethod
    def enqueue(self, fn: Callable, *args: Any, **kwargs: Any) -> None:
        """Schedules a function to run asynchronously outside the request lifecycle"""
        pass
