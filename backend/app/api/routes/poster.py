"""Poster routes"""
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.poster import PosterResponse, CategoryResponse, PosterFilterParams
from app.services.poster import PosterService
from app.db.session import get_db
from fastapi import Depends
from typing import Optional

router = APIRouter(prefix="/posters", tags=["posters"])


@router.get("", response_model=list[PosterResponse])
async def get_posters(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    """Get all posters"""
    try:
        service = PosterService(session)
        return await service.get_all_posters(skip, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(
    session: AsyncSession = Depends(get_db),
):
    """Get all categories"""
    try:
        service = PosterService(session)
        return await service.get_all_categories()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/search", response_model=list[PosterResponse])
async def search_posters(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    theme: Optional[str] = Query(None),
    style: Optional[str] = Query(None),
    orientation: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    """Search posters with filters"""
    try:
        service = PosterService(session)
        filters = PosterFilterParams(
            search=search,
            category=category,
            min_price=min_price,
            max_price=max_price,
            theme=theme,
            style=style,
            orientation=orientation,
            skip=skip,
            limit=limit,
        )
        return await service.search_posters(filters)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/trending", response_model=list[PosterResponse])
async def get_trending(
    limit: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_db),
):
    """Get trending posters"""
    try:
        service = PosterService(session)
        return await service.get_trending_posters(limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/featured", response_model=list[PosterResponse])
async def get_featured(
    limit: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_db),
):
    """Get featured posters"""
    try:
        service = PosterService(session)
        return await service.get_featured_posters(limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/{poster_id}", response_model=PosterResponse)
async def get_poster(
    poster_id: int,
    session: AsyncSession = Depends(get_db),
):
    """Get poster by ID"""
    try:
        service = PosterService(session)
        return await service.get_poster(poster_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
