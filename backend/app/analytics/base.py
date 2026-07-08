from abc import ABC, abstractmethod
from typing import List, Any
from app.models.order import Order


class MetricCalculator(ABC):
    """Abstract interface for all dashboard widget metric calculators"""
    
    @abstractmethod
    def calculate(self, orders: List[Order]) -> Any:
        """
        Processes a list of orders and returns computed structure 
        appropriate for display on widgets.
        """
        pass
