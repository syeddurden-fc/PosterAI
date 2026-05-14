"""Order and payment schemas"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.poster import PosterResponse


class OrderItemBase(BaseModel):
    """Base order item schema"""

    poster_id: int
    quantity: int
    price: float


class OrderItemResponse(OrderItemBase):
    """Order item response schema"""

    id: int
    order_id: int
    poster: Optional[PosterResponse] = None

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    """Base order schema"""

    total_amount: float
    payment_status: str = "pending"


class OrderCreate(BaseModel):
    """Order creation schema"""

    items: list[OrderItemBase]


class OrderResponse(OrderBase):
    """Order response schema"""

    id: int
    user_id: int
    items: list[OrderItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentInitiate(BaseModel):
    """Payment initiation schema"""

    order_id: int
    payment_provider: str  # upi, gpay, phonpe


class PaymentResponse(BaseModel):
    """Payment response schema"""

    id: int
    order_id: int
    payment_provider: str
    payment_status: str
    transaction_reference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
