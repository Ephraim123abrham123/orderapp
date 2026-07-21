import pytest
from decimal import Decimal
import httpx

from app.adapters.external_api.exchange_rate_adapter import ExchangeRateAdapter, FALLBACK_RATES_TO_USD

@pytest.mark.asyncio
async def test_exchange_rate_adapter_api_failure_fallback(mocker):
    # Mock httpx.AsyncClient.get to throw a connection error
    mock_get = mocker.patch("httpx.AsyncClient.get")
    mock_get.side_effect = httpx.ConnectTimeout("Mocked API connection timeout")
    
    adapter = ExchangeRateAdapter()
    
    # EUR is in FALLBACK_RATES_TO_USD with a rate of 1.09
    converted_amount = await adapter.convert_to_usd(Decimal("100.00"), "EUR")
    
    # Assert fallback was used
    expected_amount = Decimal("100.00") * FALLBACK_RATES_TO_USD["EUR"]
    assert converted_amount == expected_amount.quantize(Decimal("0.01"))

@pytest.mark.asyncio
async def test_exchange_rate_adapter_unknown_currency_fallback(mocker):
    # Mock API to fail as well
    mocker.patch("httpx.AsyncClient.get", side_effect=Exception("API Down"))
    
    adapter = ExchangeRateAdapter()
    
    # Convert an unknown currency not defined in fallback (e.g. ZWD)
    converted_amount = await adapter.convert_to_usd(Decimal("50.00"), "XYZ")
    
    # Should default to 1.00 multiplier (meaning returns the amount as-is)
    assert converted_amount == Decimal("50.00")
