"""Poster repository"""
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.models.poster import Poster, Category
from app.repositories.base import BaseRepository


class PosterRepository(BaseRepository[Poster]):
    """Poster repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, Poster)

    async def get_by_category(
        self, category_id: int, skip: int = 0, limit: int = 20
    ) -> list[Poster]:
        """Get posters by category"""
        query = (
            select(Poster)
            .where(Poster.category_id == category_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def search(
        self,
        search_query: Optional[str] = None,
        category_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        theme: Optional[str] = None,
        style: Optional[str] = None,
        orientation: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> list[Poster]:
        """Search posters with filters"""
        conditions = []

        if search_query:
            conditions.append(
                or_(
                    Poster.title.ilike(f"%{search_query}%"),
                    Poster.description.ilike(f"%{search_query}%"),
                )
            )

        if category_id:
            conditions.append(Poster.category_id == category_id)

        if min_price is not None:
            conditions.append(Poster.price >= min_price)

        if max_price is not None:
            conditions.append(Poster.price <= max_price)

        if theme:
            conditions.append(Poster.theme == theme)

        if style:
            conditions.append(Poster.style == style)

        if orientation:
            conditions.append(Poster.orientation == orientation)

        query = select(Poster)
        if conditions:
            query = query.where(and_(*conditions))

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_featured(self, limit: int = 10) -> list[Poster]:
        """Get featured posters"""
        query = (
            select(Poster)
            .where(Poster.is_featured == True)
            .limit(limit)
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_trending(self, limit: int = 10) -> list[Poster]:
        """Get trending posters (by rating)"""
        query = (
            select(Poster)
            .order_by(Poster.rating.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return result.scalars().all()


class CategoryRepository(BaseRepository[Category]):
    """Category repository"""

    def __init__(self, session: AsyncSession):
        super().__init__(session, Category)

    async def get_by_slug(self, slug: str) -> Optional[Category]:
        """Get category by slug"""
        query = select(Category).where(Category.slug == slug)
        result = await self.session.execute(query)
        return result.scalars().first()
