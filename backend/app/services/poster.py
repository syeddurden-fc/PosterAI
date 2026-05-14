"""Poster service"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.poster import PosterRepository, CategoryRepository
from app.schemas.poster import PosterResponse, CategoryResponse, PosterFilterParams


class PosterService:
    """Poster service"""

    def __init__(self, session: AsyncSession):
        self.poster_repo = PosterRepository(session)
        self.category_repo = CategoryRepository(session)

    async def get_all_posters(
        self, skip: int = 0, limit: int = 20
    ) -> list[PosterResponse]:
        """Get all posters"""
        posters = await self.poster_repo.get_all(skip, limit)
        return [PosterResponse.model_validate(p) for p in posters]

    async def get_poster(self, poster_id: int) -> PosterResponse:
        """Get poster by ID"""
        poster = await self.poster_repo.get_by_id(poster_id)
        if not poster:
            raise ValueError("Poster not found")
        return PosterResponse.model_validate(poster)

    async def search_posters(self, filters: PosterFilterParams) -> list[PosterResponse]:
        """Search posters with filters"""
        category_id = None
        if filters.category:
            category = await self.category_repo.get_by_slug(filters.category)
            if category:
                category_id = category.id

        posters = await self.poster_repo.search(
            search_query=filters.search,
            category_id=category_id,
            min_price=filters.min_price,
            max_price=filters.max_price,
            theme=filters.theme,
            style=filters.style,
            orientation=filters.orientation,
            skip=filters.skip,
            limit=filters.limit,
        )
        return [PosterResponse.model_validate(p) for p in posters]

    async def get_featured_posters(self, limit: int = 10) -> list[PosterResponse]:
        """Get featured posters"""
        posters = await self.poster_repo.get_featured(limit)
        return [PosterResponse.model_validate(p) for p in posters]

    async def get_trending_posters(self, limit: int = 10) -> list[PosterResponse]:
        """Get trending posters"""
        posters = await self.poster_repo.get_trending(limit)
        return [PosterResponse.model_validate(p) for p in posters]

    async def get_all_categories(self) -> list[CategoryResponse]:
        """Get all categories"""
        categories = await self.category_repo.get_all(skip=0, limit=100)
        return [CategoryResponse.model_validate(c) for c in categories]
