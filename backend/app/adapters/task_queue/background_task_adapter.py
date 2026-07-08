from fastapi import BackgroundTasks
from typing import Callable, Any
from app.adapters.task_queue.base import TaskQueuePort


class BackgroundTaskAdapter(TaskQueuePort):
    """Concrete adapter wrapping FastAPI's build-in BackgroundTasks"""
    
    def __init__(self, background_tasks: BackgroundTasks):
        self.background_tasks = background_tasks

    def enqueue(self, fn: Callable, *args: Any, **kwargs: Any) -> None:
        self.background_tasks.add_task(fn, *args, **kwargs)
        
    # We can also add options for CeleryAdapter stub representation in the future.
