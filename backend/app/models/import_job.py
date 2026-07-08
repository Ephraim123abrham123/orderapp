from datetime import datetime
import uuid
from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as pgUUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class ImportJob(Base):
    __tablename__ = "import_jobs"
    
    job_id: Mapped[uuid.UUID] = mapped_column(
        pgUUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    status: Mapped[str] = mapped_column(String(50), default="Pending", nullable=False)
    success_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_log: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )
