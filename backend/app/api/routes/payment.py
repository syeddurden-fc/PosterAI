"""Payment routes"""
from fastapi import APIRouter, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.order import PaymentInitiate, PaymentResponse
from app.services.order import OrderService
from app.db.session import get_db
from app.core.security import decode_token
from fastapi import Depends
from typing import Optional

router = APIRouter(prefix="/payment", tags=["payment"])


def get_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Extract user ID from authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        return int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(
    payment_data: PaymentInitiate,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Initiate payment"""
    try:
        service = OrderService(session)
        result = await service.initiate_payment(payment_data)
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


@router.post("/success/{payment_id}")
async def payment_success(
    payment_id: int,
    transaction_ref: str,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Mark payment as successful"""
    try:
        service = OrderService(session)
        result = await service.complete_payment(payment_id, transaction_ref)
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
