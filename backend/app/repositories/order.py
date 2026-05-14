"""Order repository"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem, Payment
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """Order repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, Order)

    async def get_user_orders(self, user_id: int, skip: int = 0, limit: int = 20):
        """Get all orders for a user"""
        query = (
            select(Order)
            .where(Order.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(query)
        return result.scalars().all()


class OrderItemRepository(BaseRepository[OrderItem]):
    """Order item repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, OrderItem)

    async def get_order_items(self, order_id: int) -> list[OrderItem]:
        """Get all items for an order"""
        query = select(OrderItem).where(OrderItem.order_id == order_id)
        result = await self.session.execute(query)
        return result.scalars().all()


class PaymentRepository(BaseRepository[Payment]):
    """Payment repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, Payment)

    async def get_order_payment(self, order_id: int):
        """Get payment for an order"""
        query = select(Payment).where(Payment.order_id == order_id)
        result = await self.session.execute(query)
        return result.scalars().first()
