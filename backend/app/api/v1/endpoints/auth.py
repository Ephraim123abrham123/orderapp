from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import Token, UserOut, UserLogin
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """OAuth2 standard form-based login (for Swagger Authorize UI)"""
    auth_service = AuthService(db)
    return await auth_service.login(form_data.username, form_data.password)


@router.post("/login-json", response_model=Token)
async def login_json(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """JSON-body based login (for modern frontend apps)"""
    auth_service = AuthService(db)
    return await auth_service.login(login_data.username, login_data.password)


@router.get("/me", response_model=UserOut)
async def read_users_me(
    current_user: User = Depends(deps.get_current_user)
):
    """Fetch profile of current authenticated user"""
    return current_user
