from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AuditLogBase(BaseModel):
    entity_type: str
    entity_id: int
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    changed_by: Optional[int] = None


class AuditLogOut(AuditLogBase):
    id: int
    changed_by: Optional[int] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    items: List[AuditLogOut]
    total: int
    page: int
    size: int
