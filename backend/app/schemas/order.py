from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class OrderBase(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    status: str = Field("Pending")


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=255, description="Name of the customer ordering")
    amount: Decimal = Field(..., gt=0, description="Order total amount")
    currency: Optional[str] = Field("USD", description="Currency of the order (e.g. USD, EUR, GBP)")
    status: Optional[str] = Field("Pending", description="Initial order status")

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        if v.upper() not in ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]:
            raise ValueError("Supported currencies are USD, EUR, GBP, CAD, AUD, JPY")
        return v.upper()


class OrderUpdateStatus(BaseModel):
    status: str = Field(..., description="New status for the order")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed_statuses = ["Pending", "Processing", "Completed", "Cancelled"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of {allowed_statuses}")
        return v


class OrderOut(BaseModel):
    id: int
    customer_name: str
    amount: Decimal
    currency: str
    usd_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    size: int
