"""Order and payment models"""
from sqlalchemy import ForeignKey, String, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Order(Base, TimestampMixin):
    """Customer order"""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    total_amount: Mapped[float] = mapped_column(Float)
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")

    def __repr__(self) -> str:
        return f"<Order(id={self.id}, user_id={self.user_id}, total_amount={self.total_amount})>"


class OrderItem(Base, TimestampMixin):
    """Individual item in an order"""

    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    poster_id: Mapped[int] = mapped_column(ForeignKey("posters.id"))
    quantity: Mapped[int] = mapped_column(default=1)
    price: Mapped[float] = mapped_column(Float)

    def __repr__(self) -> str:
        return f"<OrderItem(id={self.id}, order_id={self.order_id}, poster_id={self.poster_id})>"


class Payment(Base, TimestampMixin):
    """Payment transaction"""

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    payment_provider: Mapped[str] = mapped_column(String(50))  # upi, gpay, phonpe
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")
    transaction_reference: Mapped[str] = mapped_column(String(255), nullable=True)

    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, order_id={self.order_id}, payment_provider={self.payment_provider})>"
