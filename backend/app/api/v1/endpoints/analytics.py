from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import MetricResponse, DashboardLayoutSchema
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/metrics", response_model=MetricResponse)
async def get_analytics_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Fetch computed KPIs and charts for dashboard display"""
    analytics_service = AnalyticsService(db)
    metrics = await analytics_service.get_dashboard_metrics()
    return MetricResponse(metrics=metrics)


@router.get("/layout", response_model=DashboardLayoutSchema)
async def get_dashboard_layout(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Retrieve the current user's customizable dashboard widget configuration layout"""
    analytics_service = AnalyticsService(db)
    layout = await analytics_service.get_dashboard_layout(current_user.id)
    return DashboardLayoutSchema(**layout)


@router.post("/layout", response_model=DashboardLayoutSchema)
async def save_dashboard_layout(
    layout_in: DashboardLayoutSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update and persist the user's custom layout widget grid settings"""
    analytics_service = AnalyticsService(db)
    layout_dict = layout_in.model_dump()
    layout = await analytics_service.save_dashboard_layout(current_user.id, layout_dict)
    return DashboardLayoutSchema(**layout)
