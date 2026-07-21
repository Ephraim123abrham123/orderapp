from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_log import AuditLogListResponse
from app.repositories.audit_log_repository import AuditLogRepository

router = APIRouter()


@router.get("", response_model=AuditLogListResponse)
async def list_audit_logs(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type (e.g. order)"),
    entity_id: Optional[int] = Query(None, description="Filter by entity ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Retrieve list of system mutation audit logs with pagination and filters"""
    repo = AuditLogRepository(db)
    skip = (page - 1) * size
    items, total = await repo.get_list(
        skip=skip,
        limit=size,
        entity_type=entity_type,
        entity_id=entity_id
    )
    return AuditLogListResponse(items=items, total=total, page=page, size=size)
