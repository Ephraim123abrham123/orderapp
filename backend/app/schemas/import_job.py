from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict


class ImportJobOut(BaseModel):
    job_id: uuid.UUID
    status: str
    success_count: int
    failed_count: int
    error_log: list
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
