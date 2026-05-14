"""Cart repository"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.models.cart import CartItem
from app.repositories.base import BaseRepository


class CartRepository(BaseRepository[CartItem]):
    """Cart repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, CartItem)

    async def get_user_cart(self, user_id: int) -> list[CartItem]:
        """Get all cart items for a user"""
        query = select(CartItem).where(CartItem.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_cart_item(
        self, user_id: int, poster_id: int
    ) -> Optional[CartItem]:
        """Get specific cart item"""
        query = select(CartItem).where(
            (CartItem.user_id == user_id) & (CartItem.poster_id == poster_id)
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def clear_user_cart(self, user_id: int) -> None:
        """Clear all items from user's cart"""
        query = select(CartItem).where(CartItem.user_id == user_id)
        result = await self.session.execute(query)
        items = result.scalars().all()
        for item in items:
            await self.session.delete(item)
        await self.session.flush()
