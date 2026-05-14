"""Cart model"""
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class CartItem(Base, TimestampMixin):
    """Shopping cart item"""

    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    poster_id: Mapped[int] = mapped_column(ForeignKey("posters.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    def __repr__(self) -> str:
        return f"<CartItem(id={self.id}, user_id={self.user_id}, poster_id={self.poster_id}, quantity={self.quantity})>"
