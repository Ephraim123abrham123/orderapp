from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.exceptions import OrderAppException, BulkImportError, PartialImportError
from app.core.logging import logger


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(OrderAppException)
    async def order_app_exception_handler(request: Request, exc: OrderAppException):
        logger.error(f"Application error: {exc.message} - Path: {request.url.path}")
        content = {"detail": exc.message}
        
        # Include custom fields for import jobs if present
        if isinstance(exc, BulkImportError):
            content["error_log"] = exc.error_log
        elif isinstance(exc, PartialImportError):
            content["success_count"] = exc.success_count
            content["failed_count"] = exc.failed_count
            content["error_log"] = exc.error_log
            
        return JSONResponse(
            status_code=exc.status_code,
            content=content
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled system error: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred. Please contact administration."}
        )
