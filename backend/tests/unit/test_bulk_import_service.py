import pytest
import uuid
import decimal
from unittest.mock import AsyncMock, MagicMock

from app.services.bulk_import_service import BulkImportService
from app.models.import_job import ImportJob
from app.models.order import Order
from sqlalchemy import select

@pytest.mark.asyncio
async def test_process_import_success_and_failures(db_session, mocker):
    # Mock database session factory inside the service to yield our test db session
    mock_session_maker = MagicMock()
    mock_session_maker.return_value.__aenter__.return_value = db_session
    mocker.patch("app.services.bulk_import_service.async_session_maker", mock_session_maker)
    
    # Mock parser to return a mix of valid and invalid rows
    mock_csv_rows = [
        {"customer_name": "Valid Customer 1", "amount": "150.00", "currency": "USD", "_row_number": 2},
        {"customer_name": "", "amount": "200.00", "currency": "USD", "_row_number": 3},          # Invalid: missing name
        {"customer_name": "Valid Customer 2", "amount": "invalid-amt", "currency": "EUR", "_row_number": 4}, # Invalid: bad amount
        {"customer_name": "Valid Customer 3", "amount": " $100.50 ", "currency": "GBP", "_row_number": 5}, # Valid: formatting cleaned
    ]
    mocker.patch("app.adapters.file_parsers.csv_parser_adapter.CsvParserAdapter.parse", return_value=mock_csv_rows)
    
    # Mock currency exchange adapter
    mock_convert = mocker.patch("app.adapters.external_api.exchange_rate_adapter.ExchangeRateAdapter.convert_to_usd", new_callable=AsyncMock)
    # Return same value or calculated mock value
    mock_convert.side_effect = lambda amount, currency: amount * decimal.Decimal("1.2") if currency == "GBP" else amount
    
    # Mock WebSocket notifications
    mock_progress = mocker.patch("app.adapters.notifications.websocket_adapter.WebSocketNotificationAdapter.broadcast_import_progress", new_callable=AsyncMock)
    mock_complete = mocker.patch("app.adapters.notifications.websocket_adapter.WebSocketNotificationAdapter.broadcast_import_complete", new_callable=AsyncMock)
    
    # Pre-insert import job
    job_id = uuid.uuid4()
    job = ImportJob(
        job_id=job_id,
        status="Pending",
        success_count=0,
        failed_count=0,
        error_log=[]
    )
    db_session.add(job)
    await db_session.commit()
    
    service = BulkImportService()
    await service.process_import(job_id, b"dummy csv data", "test.csv")
    
    # Refresh job data from DB session
    await db_session.refresh(job)
    
    # Assert job metrics and status
    assert job.status == "Completed"
    assert job.success_count == 2
    assert job.failed_count == 2
    assert len(job.error_log) == 2
    
    # Verify error details
    assert job.error_log[0]["row"] == 3
    assert "Customer name is required" in job.error_log[0]["error"]
    
    assert job.error_log[1]["row"] == 4
    assert "Invalid amount format" in job.error_log[1]["error"]
    
    # Verify valid orders were inserted into DB
    result = await db_session.execute(select(Order).order_by(Order.customer_name))
    orders = result.scalars().all()
    assert len(orders) == 2
    assert orders[0].customer_name == "Valid Customer 1"
    assert orders[0].amount == decimal.Decimal("150.00")
    
    assert orders[1].customer_name == "Valid Customer 3"
    assert orders[1].amount == decimal.Decimal("100.50")
    assert orders[1].usd_amount == decimal.Decimal("120.60") # 100.50 * 1.2
    
    # Verify WebSocket progress/complete calls
    assert mock_progress.call_count >= 1
    mock_complete.assert_called_once_with(
        job_id=str(job_id),
        success_count=2,
        failed_count=2,
        error_log=job.error_log,
        status="Completed"
    )
