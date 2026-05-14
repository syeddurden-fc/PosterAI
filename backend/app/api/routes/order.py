"""Order routes"""
from fastapi import APIRouter, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.order import OrderCreate, OrderResponse, PaymentInitiate, PaymentResponse
from app.services.order import OrderService
from app.db.session import get_db
from app.core.security import decode_token
from fastapi import Depends
from typing import Optional

router = APIRouter(prefix="/orders", tags=["orders"])


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


@router.post("/create", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Create order"""
    try:
        service = OrderService(session)
        result = await service.create_order(user_id, order_data)
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


@router.get("/history", response_model=list[OrderResponse])
async def get_order_history(
    skip: int = 0,
    limit: int = 20,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Get user's order history"""
    try:
        service = OrderService(session)
        return await service.get_user_orders(user_id, skip, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Get order details"""
    try:
        service = OrderService(session)
        return await service.get_order(order_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
