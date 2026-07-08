from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, create_access_token
from app.core.exceptions import InvalidCredentialsException
from app.models.user import User
from app.schemas.auth import Token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)

    async def authenticate_user(self, username: str, password: str) -> User:
        user = await self.user_repo.get_by_username(username)
        if not user:
            raise InvalidCredentialsException()
        
        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsException()
            
        return user

    async def login(self, username: str, password: str) -> Token:
        user = await self.authenticate_user(username, password)
        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token, token_type="bearer")
