"""AI repository"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.models.ai import AIRoomSession, AILayout
from app.repositories.base import BaseRepository


class AIRoomSessionRepository(BaseRepository[AIRoomSession]):
    """AI room session repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, AIRoomSession)

    async def get_user_sessions(self, user_id: int) -> list[AIRoomSession]:
        """Get all sessions for a user"""
        query = select(AIRoomSession).where(AIRoomSession.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_active_session(self, user_id: int) -> Optional[AIRoomSession]:
        """Get active session for a user"""
        query = select(AIRoomSession).where(
            (AIRoomSession.user_id == user_id) & (AIRoomSession.status == "active")
        )
        result = await self.session.execute(query)
        return result.scalars().first()


class AILayoutRepository(BaseRepository[AILayout]):
    """AI layout repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, AILayout)

    async def get_session_layouts(self, session_id: int) -> list[AILayout]:
        """Get all layouts for a session"""
        query = select(AILayout).where(AILayout.session_id == session_id)
        result = await self.session.execute(query)
        return result.scalars().all()
