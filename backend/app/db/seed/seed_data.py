"""Seed database with sample data"""
import asyncio
import os
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.poster import Category, Poster
from app.models.user import User
from app.core.security import hash_password
from app.core.config import get_settings
from app.db.seed.poster_images import POSTER_IMAGES

settings = get_settings()


async def seed_categories():
    """Seed categories"""
    async with AsyncSessionLocal() as session:
        categories = [
            Category(name="Anime", slug="anime"),
            Category(name="Gaming", slug="gaming"),
            Category(name="Movies", slug="movies"),
            Category(name="Music", slug="music"),
            Category(name="Minimal", slug="minimal"),
            Category(name="Luxury", slug="luxury"),
            Category(name="Dark Aesthetic", slug="dark-aesthetic"),
        ]

        for cat in categories:
            session.add(cat)

        await session.commit()
        print(f"✓ Categories seeded ({len(categories)} categories)")


async def seed_posters():
    """Seed sample posters"""
    async with AsyncSessionLocal() as session:
        # First, get all categories
        from sqlalchemy import select
        result = await session.execute(select(Category))
        categories = {cat.slug: cat.id for cat in result.scalars().all()}
        
        posters = []
        for poster_data in POSTER_IMAGES:
            category_slug = poster_data.pop("category_slug")
            category_id = categories.get(category_slug, 1)  # Default to first category
            
            poster = Poster(
                category_id=category_id,
                **poster_data
            )
            posters.append(poster)
            session.add(poster)

        await session.commit()
        print(f"✓ Posters seeded ({len(posters)} posters)")


async def seed_users():
    """Seed sample users"""
    async with AsyncSessionLocal() as session:
        users = [
            User(
                name="Demo User",
                email="demo@wallcraft.ai",
                password_hash=hash_password("demo123"),
            ),
            User(
                name="Test User",
                email="test@wallcraft.ai",
                password_hash=hash_password("test123"),
            ),
        ]

        for user in users:
            session.add(user)

        await session.commit()
        print(f"✓ Users seeded ({len(users)} users)")


async def seed_all():
    """Seed all data"""
    print(f"\n🌱 Seeding database for {settings.APP_NAME} ({settings.ENVIRONMENT})...")
    print(f"📊 Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'local'}")
    
    await seed_categories()
    await seed_posters()
    await seed_users()
    
    print("\n✅ Database seeded successfully!\n")


if __name__ == "__main__":
    asyncio.run(seed_all())
