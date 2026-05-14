"""Cart schemas"""
from pydantic import BaseModel
from app.schemas.poster import PosterResponse


class CartItemBase(BaseModel):
    """Base cart item schema"""

    poster_id: int
    quantity: int = 1


class CartItemResponse(CartItemBase):
    """Cart item response schema"""

    id: int
    poster: PosterResponse

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    """Cart response schema"""

    items: list[CartItemResponse]
    total_count: int
    total_price: float
