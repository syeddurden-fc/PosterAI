"""Base repository with common CRUD operations"""
from typing import Generic, TypeVar, Optional, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Base repository with common CRUD operations"""

    def __init__(self, session: AsyncSession, model: type[T]):
        self.session = session
        self.model = model

    async def create(self, obj_in: dict[str, Any]) -> T:
        """Create a new object"""
        db_obj = self.model(**obj_in)
        self.session.add(db_obj)
        await self.session.flush()
        return db_obj

    async def get_by_id(self, id: int) -> Optional[T]:
        """Get object by ID"""
        return await self.session.get(self.model, id)

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        """Get all objects with pagination"""
        query = select(self.model).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def update(self, id: int, obj_in: dict[str, Any]) -> Optional[T]:
        """Update an object"""
        db_obj = await self.get_by_id(id)
        if db_obj:
            for key, value in obj_in.items():
                setattr(db_obj, key, value)
            await self.session.flush()
        return db_obj

    async def delete(self, id: int) -> bool:
        """Delete an object"""
        db_obj = await self.get_by_id(id)
        if db_obj:
            await self.session.delete(db_obj)
            await self.session.flush()
            return True
        return False

    async def count(self) -> int:
        """Count total objects"""
        query = select(func.count(self.model.id))
        result = await self.session.execute(query)
        return result.scalar() or 0
