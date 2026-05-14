"""AI room session and layout models"""
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timedelta
import os

from app.db.base import Base, TimestampMixin
from app.core.config import get_settings

settings = get_settings()


class AIRoomSession(Base, TimestampMixin):
    """AI room visualization session"""

    __tablename__ = "ai_room_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    wall_image_path: Mapped[str] = mapped_column(String(500))
    wall_color: Mapped[str] = mapped_column(String(20), nullable=True)  # hex color
    layout_style: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")  # active, expired
    expires_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now() + timedelta(hours=settings.SESSION_EXPIRY_HOURS)
    )

    def __repr__(self) -> str:
        return f"<AIRoomSession(id={self.id}, user_id={self.user_id}, status={self.status})>"


class AILayout(Base, TimestampMixin):
    """Generated AI layout for a session"""

    __tablename__ = "ai_layouts"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("ai_room_sessions.id"))
    layout_type: Mapped[str] = mapped_column(String(100))
    layout_metadata_json: Mapped[str] = mapped_column(Text)  # JSON string
    generated_preview_path: Mapped[str] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<AILayout(id={self.id}, session_id={self.session_id}, layout_type={self.layout_type})>"
