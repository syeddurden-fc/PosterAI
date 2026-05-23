"""Cart routes"""
from fastapi import APIRouter, HTTPException, status, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.cart import CartResponse, CartItemBase
from app.services.cart import CartService
from app.db.session import get_db
from app.core.security import decode_token
from fastapi import Depends
from typing import Optional

router = APIRouter(prefix="/cart", tags=["cart"])


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


@router.get("", response_model=CartResponse)
async def get_cart(
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Get user's cart"""
    try:
        service = CartService(session)
        return await service.get_cart(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/add", response_model=CartResponse)
async def add_to_cart(
    item: CartItemBase,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Add poster to cart"""
    try:
        service = CartService(session)
        await service.add_to_cart(user_id, item.poster_id, item.quantity)
        await session.commit()
        # Return updated cart
        return await service.get_cart(user_id)
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/remove/{poster_id}", response_model=CartResponse)
async def remove_from_cart(
    poster_id: int,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Remove poster from cart"""
    try:
        service = CartService(session)
        await service.remove_from_cart(user_id, poster_id)
        await session.commit()
        # Return updated cart
        return await service.get_cart(user_id)
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.put("/update/{poster_id}", response_model=CartResponse)
async def update_quantity(
    poster_id: int,
    quantity: int = Query(..., ge=1),
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Update item quantity"""
    try:
        service = CartService(session)
        await service.update_quantity(user_id, poster_id, quantity)
        await session.commit()
        # Return updated cart
        return await service.get_cart(user_id)
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
