from typing import Any, Dict, List, Optional


class OrderAppException(Exception):
    """Base exception for Order Application"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class EntityNotFoundException(OrderAppException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            message=f"{entity_name} with id {entity_id} not found",
            status_code=404
        )


class UnauthorizedException(OrderAppException):
    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(message=message, status_code=401)


class InvalidCredentialsException(OrderAppException):
    def __init__(self, message: str = "Incorrect username or password"):
        super().__init__(message=message, status_code=400)


class InvalidFileFormatException(OrderAppException):
    def __init__(self, message: str = "Invalid file format. Only Excel (.xlsx) and CSV (.csv) are supported"):
        super().__init__(message=message, status_code=400)


class BulkImportError(OrderAppException):
    def __init__(self, message: str, error_log: Optional[List[Dict[str, Any]]] = None):
        super().__init__(message=message, status_code=400)
        self.error_log = error_log or []


class PartialImportError(OrderAppException):
    def __init__(self, message: str, success_count: int, failed_count: int, error_log: List[Dict[str, Any]]):
        super().__init__(message=message, status_code=400)
        self.success_count = success_count
        self.failed_count = failed_count
        self.error_log = error_log
