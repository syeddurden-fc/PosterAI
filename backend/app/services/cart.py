"""Cart service"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.cart import CartRepository
from app.repositories.poster import PosterRepository
from app.schemas.cart import CartResponse, CartItemResponse
from app.models.cart import CartItem


class CartService:
    """Cart service"""

    def __init__(self, session: AsyncSession):
        self.cart_repo = CartRepository(session)
        self.poster_repo = PosterRepository(session)
        self.session = session

    async def add_to_cart(self, user_id: int, poster_id: int, quantity: int = 1):
        """Add poster to cart"""
        # Check if poster exists
        poster = await self.poster_repo.get_by_id(poster_id)
        if not poster:
            raise ValueError("Poster not found")

        # Check if item already in cart
        existing = await self.cart_repo.get_cart_item(user_id, poster_id)
        if existing:
            existing.quantity += quantity
            await self.session.flush()
            return existing

        # Add new item
        return await self.cart_repo.create(
            {
                "user_id": user_id,
                "poster_id": poster_id,
                "quantity": quantity,
            }
        )

    async def remove_from_cart(self, user_id: int, poster_id: int):
        """Remove poster from cart"""
        item = await self.cart_repo.get_cart_item(user_id, poster_id)
        if item:
            await self.cart_repo.delete(item.id)

    async def update_quantity(self, user_id: int, poster_id: int, quantity: int):
        """Update item quantity"""
        item = await self.cart_repo.get_cart_item(user_id, poster_id)
        if not item:
            raise ValueError("Item not in cart")

        if quantity <= 0:
            await self.cart_repo.delete(item.id)
        else:
            await self.cart_repo.update(item.id, {"quantity": quantity})

    async def get_cart(self, user_id: int) -> CartResponse:
        """Get user's cart"""
        items = await self.cart_repo.get_user_cart(user_id)

        cart_items = []
        total_price = 0.0

        for item in items:
            poster = await self.poster_repo.get_by_id(item.poster_id)
            if poster:
                cart_items.append(
                    CartItemResponse(
                        id=item.id,
                        poster_id=item.poster_id,
                        quantity=item.quantity,
                        poster=poster,
                    )
                )
                total_price += poster.price * item.quantity

        return CartResponse(
            items=cart_items,
            total_count=sum(item.quantity for item in items),
            total_price=total_price,
        )

    async def clear_cart(self, user_id: int):
        """Clear user's cart"""
        await self.cart_repo.clear_user_cart(user_id)
