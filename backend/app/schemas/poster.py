"""Poster and category schemas"""
from pydantic import BaseModel
from typing import Optional


class CategoryBase(BaseModel):
    """Base category schema"""

    name: str
    slug: str


class CategoryResponse(CategoryBase):
    """Category response schema"""

    id: int

    class Config:
        from_attributes = True


class PosterBase(BaseModel):
    """Base poster schema"""

    title: str
    description: Optional[str] = None
    image_url: str
    category_id: int
    price: float
    width: int
    height: int
    orientation: str
    style: str
    theme: str
    rating: float = 0.0
    is_featured: bool = False


class PosterCreate(PosterBase):
    """Poster creation schema"""

    pass


class PosterResponse(PosterBase):
    """Poster response schema"""

    id: int
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class PosterFilterParams(BaseModel):
    """Poster filter parameters"""

    category: Optional[str] = None
    search: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    theme: Optional[str] = None
    style: Optional[str] = None
    orientation: Optional[str] = None
    sort_by: Optional[str] = "created_at"  # created_at, price, rating
    sort_order: Optional[str] = "desc"  # asc, desc
    skip: int = 0
    limit: int = 20
