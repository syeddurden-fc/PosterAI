"""User repository"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """User repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        query = select(User).where(User.email == email)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def email_exists(self, email: str) -> bool:
        """Check if email already exists"""
        user = await self.get_by_email(email)
        return user is not None


    async def email_exists(self, email: str) -> bool:
        """Check if email exists"""
        user = await self.get_by_email(email)
        return user is not None
