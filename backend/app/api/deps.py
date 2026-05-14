"""Dependency injection for routes"""
from typing import Annotated
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import decode_token


async def get_current_user_id(token: str = Depends(lambda: None)) -> int:
    """Get current user ID from token"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        if user_id is None:
            raise ValueError("Invalid token")
        return user_id
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


CurrentUserId = Annotated[int, Depends(get_current_user_id)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
