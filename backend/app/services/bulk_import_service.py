import decimal
import uuid
from app.db.session import async_session_maker
from app.repositories.import_job_repository import ImportJobRepository
from app.repositories.order_repository import OrderRepository
from app.adapters.file_parsers.excel_parser_adapter import ExcelParserAdapter
from app.adapters.file_parsers.csv_parser_adapter import CsvParserAdapter
from app.adapters.external_api.exchange_rate_adapter import ExchangeRateAdapter
from app.adapters.notifications.websocket_adapter import WebSocketNotificationAdapter
from app.schemas.order import OrderCreate
from app.core.logging import logger


class BulkImportService:
    def __init__(self):
        self.excel_parser = ExcelParserAdapter()
        self.csv_parser = CsvParserAdapter()
        self.exchange_adapter = ExchangeRateAdapter()
        self.notifier = WebSocketNotificationAdapter()

    async def process_import(self, job_id: uuid.UUID, file_bytes: bytes, filename: str) -> None:
        """Asynchronous background processor for CSV/Excel file uploads"""
        # Since this runs asynchronously outside the main request context, 
        # we open and manage our own database session
        async with async_session_maker() as session:
            job_repo = ImportJobRepository(session)
            order_repo = OrderRepository(session)
            
            job = await job_repo.get_by_id(job_id)
            if not job:
                logger.error(f"Import job {job_id} not found in database.")
                return

            # Update job status to Processing
            job.status = "Processing"
            await job_repo.update(job)
            await session.commit()
            
            await self.notifier.broadcast_import_progress(
                job_id=str(job_id),
                success_count=0,
                failed_count=0,
                status="Processing"
            )

            try:
                # 1. Parse File based on extension
                if filename.endswith(".xlsx"):
                    raw_rows = self.excel_parser.parse(file_bytes)
                elif filename.endswith(".csv"):
                    raw_rows = self.csv_parser.parse(file_bytes)
                else:
                    raise ValueError("Unsupported file format. Only .xlsx and .csv are supported.")

                # 2. Iterate and Validate Rows
                valid_orders = []
                error_log = []
                success_count = 0
                failed_count = 0

                logger.info(f"Validating {len(raw_rows)} rows for import job {job_id}...")
                
                for idx, row in enumerate(raw_rows):
                    row_num = row.get("_row_number", idx + 2)
                    try:
                        # Extract parameters
                        customer_name = row.get("customer_name") or row.get("customer") or row.get("name")
                        amount_val = row.get("amount") or row.get("total") or row.get("price")
                        currency = row.get("currency") or "USD"
                        status = row.get("status") or "Pending"

                        # Strip whitespace if strings
                        if isinstance(customer_name, str):
                            customer_name = customer_name.strip()
                        if isinstance(currency, str):
                            currency = currency.strip().upper()
                        if isinstance(status, str):
                            status = status.strip()

                        # Check for empty columns
                        if not customer_name:
                            raise ValueError("Customer name is required.")
                        if amount_val is None or str(amount_val).strip() == "":
                            raise ValueError("Amount is required.")

                        # Safe decimal parse
                        try:
                            amount = decimal.Decimal(str(amount_val).replace("$", "").replace(",", "").strip())
                        except (decimal.InvalidOperation, ValueError):
                            raise ValueError(f"Invalid amount format: '{amount_val}'")

                        # Validate row structure using Pydantic OrderCreate Schema
                        order_in = OrderCreate(
                            customer_name=customer_name,
                            amount=amount,
                            currency=currency,
                            status=status
                        )

                        # Fetch USD exchange rate conversion
                        usd_amt = await self.exchange_adapter.convert_to_usd(
                            order_in.amount, 
                            order_in.currency
                        )

                        # Store data payload dictionary for SQLAlchemy bulk insert
                        valid_orders.append({
                            "customer_name": order_in.customer_name,
                            "amount": order_in.amount,
                            "currency": order_in.currency,
                            "usd_amount": usd_amt,
                            "status": order_in.status
                        })
                        success_count += 1

                    except Exception as row_error:
                        failed_count += 1
                        error_log.append({
                            "row": row_num,
                            "error": str(row_error)
                        })
                    
                    # Update progress periodically (every 50 rows) for large uploads
                    if (idx + 1) % 50 == 0 or idx == len(raw_rows) - 1:
                        await self.notifier.broadcast_import_progress(
                            job_id=str(job_id),
                            success_count=success_count,
                            failed_count=failed_count,
                            status="Processing"
                        )

                # 3. Perform Fast Bulk Database Insert
                if valid_orders:
                    await order_repo.bulk_insert(valid_orders)
                
                # 4. Finalize Job Record
                job.status = "Completed" if success_count > 0 or failed_count == 0 else "Failed"
                job.success_count = success_count
                job.failed_count = failed_count
                job.error_log = error_log
                
                await job_repo.update(job)
                await session.commit()
                logger.info(f"Import job {job_id} finalized: Completed. Success: {success_count}, Failed: {failed_count}.")

            except Exception as job_error:
                logger.exception(f"Fatal error executing import job {job_id}: {str(job_error)}")
                job.status = "Failed"
                job.error_log = [{"row": "File", "error": f"Fatal import failure: {str(job_error)}"}]
                await job_repo.update(job)
                await session.commit()

            # 5. Broadcast Final Status
            await self.notifier.broadcast_import_complete(
                job_id=str(job_id),
                success_count=job.success_count,
                failed_count=job.failed_count,
                error_log=job.error_log,
                status=job.status
            )
