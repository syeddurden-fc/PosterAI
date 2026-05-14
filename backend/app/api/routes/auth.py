"""Authentication routes"""
from fastapi import APIRouter, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.services.auth import AuthService
from app.db.session import get_db
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_db),
):
    """Register a new user"""
    try:
        auth_service = AuthService(session)
        result = await auth_service.signup(user_data)
        await session.commit()
        return result
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    session: AsyncSession = Depends(get_db),
):
    """Login user"""
    try:
        auth_service = AuthService(session)
        result = await auth_service.login(login_data)
        await session.commit()
        return result
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
