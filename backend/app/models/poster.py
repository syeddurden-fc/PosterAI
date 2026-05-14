"""Poster and category models"""
from sqlalchemy import ForeignKey, String, Float, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Category(Base, TimestampMixin):
    """Poster category model"""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name={self.name})>"


class Poster(Base, TimestampMixin):
    """Poster model"""

    __tablename__ = "posters"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    image_url: Mapped[str] = mapped_column(String(500))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    price: Mapped[float] = mapped_column(Float)
    width: Mapped[int] = mapped_column(Integer)  # in pixels
    height: Mapped[int] = mapped_column(Integer)  # in pixels
    orientation: Mapped[str] = mapped_column(String(20))  # portrait, landscape, square
    style: Mapped[str] = mapped_column(String(100))  # cinematic, minimal, etc
    theme: Mapped[str] = mapped_column(String(100))  # dark, light, colorful, etc
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    def __repr__(self) -> str:
        return f"<Poster(id={self.id}, title={self.title}, price={self.price})>"


class PosterTag(Base):
    """Poster tags for additional categorization"""

    __tablename__ = "poster_tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    poster_id: Mapped[int] = mapped_column(ForeignKey("posters.id"))
    tag: Mapped[str] = mapped_column(String(100), index=True)

    def __repr__(self) -> str:
        return f"<PosterTag(id={self.id}, poster_id={self.poster_id}, tag={self.tag})>"
