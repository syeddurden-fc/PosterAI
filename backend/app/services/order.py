"""Order service"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.order import OrderRepository, OrderItemRepository, PaymentRepository
from app.repositories.cart import CartRepository
from app.repositories.poster import PosterRepository
from app.schemas.order import OrderCreate, OrderResponse, PaymentInitiate, PaymentResponse
from app.models.order import Order, OrderItem, Payment


class OrderService:
    """Order service"""

    def __init__(self, session: AsyncSession):
        self.order_repo = OrderRepository(session)
        self.order_item_repo = OrderItemRepository(session)
        self.payment_repo = PaymentRepository(session)
        self.cart_repo = CartRepository(session)
        self.poster_repo = PosterRepository(session)
        self.session = session

    async def create_order(self, user_id: int, order_data: OrderCreate) -> OrderResponse:
        """Create order from cart"""
        # Calculate total
        total_amount = 0.0
        items_data = []

        for item in order_data.items:
            poster = await self.poster_repo.get_by_id(item.poster_id)
            if not poster:
                raise ValueError(f"Poster {item.poster_id} not found")

            item_total = poster.price * item.quantity
            total_amount += item_total

            items_data.append(
                {
                    "poster_id": item.poster_id,
                    "quantity": item.quantity,
                    "price": poster.price,
                }
            )

        # Create order
        order = await self.order_repo.create(
            {
                "user_id": user_id,
                "total_amount": total_amount,
                "payment_status": "pending",
            }
        )

        # Create order items
        for item_data in items_data:
            await self.order_item_repo.create(
                {
                    "order_id": order.id,
                    "poster_id": item_data["poster_id"],
                    "quantity": item_data["quantity"],
                    "price": item_data["price"],
                }
            )

        # Clear cart
        await self.cart_repo.clear_user_cart(user_id)

        await self.session.flush()

        # Get full order with items
        order_items = await self.order_item_repo.get_order_items(order.id)
        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            total_amount=order.total_amount,
            payment_status=order.payment_status,
            items=[],
            created_at=order.created_at,
        )

    async def get_order(self, order_id: int) -> OrderResponse:
        """Get order details"""
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        items = await self.order_item_repo.get_order_items(order_id)
        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            total_amount=order.total_amount,
            payment_status=order.payment_status,
            items=[],
            created_at=order.created_at,
        )

    async def get_user_orders(
        self, user_id: int, skip: int = 0, limit: int = 20
    ) -> list[OrderResponse]:
        """Get user's orders"""
        orders = await self.order_repo.get_user_orders(user_id, skip, limit)
        return [
            OrderResponse(
                id=order.id,
                user_id=order.user_id,
                total_amount=order.total_amount,
                payment_status=order.payment_status,
                items=[],
                created_at=order.created_at,
            )
            for order in orders
        ]

    async def initiate_payment(
        self, payment_data: PaymentInitiate
    ) -> PaymentResponse:
        """Initiate payment"""
        # Get order
        order = await self.order_repo.get_by_id(payment_data.order_id)
        if not order:
            raise ValueError("Order not found")

        # Create payment
        payment = await self.payment_repo.create(
            {
                "order_id": payment_data.order_id,
                "payment_provider": payment_data.payment_provider,
                "payment_status": "pending",
            }
        )

        await self.session.flush()
        return PaymentResponse.model_validate(payment)

    async def complete_payment(self, payment_id: int, transaction_ref: str) -> PaymentResponse:
        """Complete payment"""
        payment = await self.payment_repo.get_by_id(payment_id)
        if not payment:
            raise ValueError("Payment not found")

        # Update payment
        await self.payment_repo.update(
            payment_id,
            {
                "payment_status": "completed",
                "transaction_reference": transaction_ref,
            },
        )

        # Update order
        await self.order_repo.update(
            payment.order_id,
            {"payment_status": "completed"},
        )

        await self.session.flush()
        return PaymentResponse.model_validate(payment)
