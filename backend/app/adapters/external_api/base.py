from abc import ABC, abstractmethod
from decimal import Decimal


class ExchangeRatePort(ABC):
    """Abstract interface for currency exchange rate conversions"""
    @abstractmethod
    async def convert_to_usd(self, amount: Decimal, from_currency: str) -> Decimal:
        """Converts an amount from a given currency into USD"""
        pass
