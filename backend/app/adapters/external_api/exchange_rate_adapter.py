import time
from decimal import Decimal
import httpx
from app.adapters.external_api.base import ExchangeRatePort
from app.core.config import settings
from app.core.logging import logger

# Hardcoded fallback rates: conversion multiplier TO USD (e.g. EUR * multiplier = USD)
FALLBACK_RATES_TO_USD = {
    "USD": Decimal("1.00"),
    "EUR": Decimal("1.09"),  # 1 EUR = 1.09 USD
    "GBP": Decimal("1.29"),  # 1 GBP = 1.29 USD
    "CAD": Decimal("0.73"),  # 1 CAD = 0.73 USD
    "AUD": Decimal("0.66"),  # 1 AUD = 0.66 USD
    "JPY": Decimal("0.0062"), # 1 JPY = 0.0062 USD
}


class ExchangeRateAdapter(ExchangeRatePort):
    _rates_cache = {}
    _cache_time = 0
    _cache_ttl = 3600  # 1 hour cache TTL

    async def _fetch_rates(self) -> dict:
        """Fetch latest exchange rates from external API with time-based caching"""
        current_time = time.time()
        if self._rates_cache and (current_time - self._cache_time < self._cache_ttl):
            return self._rates_cache

        try:
            logger.info(f"Fetching currency exchange rates from: {settings.EXCHANGE_RATE_API_URL}")
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(settings.EXCHANGE_RATE_API_URL)
                response.raise_for_status()
                data = response.json()
                
                # ExchangeRate-API returns rates relative to base currency (USD in our config)
                # rates dictionary: e.g. {"EUR": 0.92, "GBP": 0.78, "USD": 1.0}
                if data.get("result") == "success" and "rates" in data:
                    usd_rates = data["rates"]
                    
                    # Convert rates to "TO_USD" multiplier
                    # e.g., if USD -> EUR is 0.92, then EUR -> USD is 1 / 0.92
                    rates_to_usd = {}
                    for currency, rate in usd_rates.items():
                        if rate > 0:
                            rates_to_usd[currency.upper()] = Decimal(1) / Decimal(str(rate))
                    
                    self._rates_cache = rates_to_usd
                    self._cache_time = current_time
                    logger.info("Successfully fetched and cached currency rates from external API.")
                    return self._rates_cache
        except Exception as e:
            logger.warning(f"Failed to fetch exchange rates from external API ({str(e)}). Falling back to local rates.")
            
        return FALLBACK_RATES_TO_USD

    async def convert_to_usd(self, amount: Decimal, from_currency: str) -> Decimal:
        currency = from_currency.upper()
        rates = await self._fetch_rates()
        
        # Look up rate in fetched rates, fall back to hardcoded dictionary, default to 1.0 (USD)
        rate = rates.get(currency) or FALLBACK_RATES_TO_USD.get(currency) or Decimal("1.00")
        
        converted = amount * rate
        # Return rounded to 2 decimal places
        return converted.quantize(Decimal("0.01"))
