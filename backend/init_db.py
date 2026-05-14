#!/usr/bin/env python3
"""
Database initialization script for WallCraft AI
Creates all tables in Supabase PostgreSQL database
Run this script once to set up the database schema
"""

import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from app.core.config import get_settings
from app.db.base import Base
from app.models.user import User
from app.models.poster import Category, Poster, PosterTag
from app.models.cart import CartItem
from app.models.order import Order, OrderItem, Payment
from app.models.ai import AIRoomSession, AILayout


async def init_db():
    """Initialize database and create all tables"""
    settings = get_settings()
    
    print(f"🔧 Initializing database...")
    print(f"📍 Database URL: {settings.DATABASE_URL}")
    
    # Create async engine
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,  # Disable echo for cleaner output
        future=True,
    )
    
    try:
        # Test connection first
        print("\n🔗 Testing database connection...")
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        
        # Create all tables
        async with engine.begin() as conn:
            print("\n📝 Creating tables...")
            await conn.run_sync(Base.metadata.create_all)
            print("✅ All tables created successfully!")
        
        # Create session factory
        async_session = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        
        # Seed initial data
        async with async_session() as session:
            print("\n🌱 Seeding initial data...")
            
            # Check if categories already exist
            from sqlalchemy import select
            result = await session.execute(select(Category))
            existing_categories = result.scalars().all()
            
            if not existing_categories:
                # Create categories
                categories = [
                    Category(name="Dark Aesthetic", slug="dark-aesthetic"),
                    Category(name="Gaming", slug="gaming"),
                    Category(name="Minimal", slug="minimal"),
                    Category(name="Luxury", slug="luxury"),
                    Category(name="Anime", slug="anime"),
                    Category(name="Movies", slug="movies"),
                    Category(name="Music", slug="music"),
                ]
                session.add_all(categories)
                await session.flush()
                print(f"✅ Created {len(categories)} categories")
                
                # Create sample posters
                posters = [
                    Poster(
                        title="Neon Cyberpunk",
                        description="A stunning neon-lit cyberpunk aesthetic poster",
                        image_url="https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=300&h=450&fit=crop",
                        category_id=categories[0].id,
                        price=299.99,
                        width=300,
                        height=450,
                        orientation="portrait",
                        style="cinematic",
                        theme="dark",
                        rating=4.8,
                        is_featured=True,
                    ),
                    Poster(
                        title="Gaming Legend",
                        description="Perfect for gaming enthusiasts",
                        image_url="https://images.unsplash.com/photo-1538481143235-5d630a3663d7?w=300&h=450&fit=crop",
                        category_id=categories[1].id,
                        price=249.99,
                        width=300,
                        height=450,
                        orientation="portrait",
                        style="cinematic",
                        theme="dark",
                        rating=4.6,
                        is_featured=True,
                    ),
                    Poster(
                        title="Minimal Zen",
                        description="Clean and minimalist design",
                        image_url="https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=450&fit=crop",
                        category_id=categories[2].id,
                        price=199.99,
                        width=300,
                        height=450,
                        orientation="portrait",
                        style="minimal",
                        theme="light",
                        rating=4.5,
                        is_featured=False,
                    ),
                    Poster(
                        title="Luxury Gold",
                        description="Elegant luxury design with gold accents",
                        image_url="https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=450&fit=crop",
                        category_id=categories[3].id,
                        price=399.99,
                        width=300,
                        height=450,
                        orientation="portrait",
                        style="luxury",
                        theme="colorful",
                        rating=4.9,
                        is_featured=True,
                    ),
                    Poster(
                        title="Anime Dreams",
                        description="Beautiful anime-inspired artwork",
                        image_url="https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=450&fit=crop",
                        category_id=categories[4].id,
                        price=229.99,
                        width=300,
                        height=450,
                        orientation="portrait",
                        style="collage",
                        theme="colorful",
                        rating=4.7,
                        is_featured=False,
                    ),
                    Poster(
                        title="Movie Magic",
                        description="Iconic movie poster design",
                        image_url="https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=300&h=450&fit=crop",
                        category_id=categories[5].id,
                        price=319.99,
                        width=300,
                        height=450,
                        orientation="portrait",
                        style="cinematic",
                        theme="dark",
                        rating=4.8,
                        is_featured=True,
                    ),
                    Poster(
                        title="Music Vibes",
                        description="Music-themed poster for music lovers",
                        image_url="https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=450&fit=crop",
                        category_id=categories[6].id,
                        price=259.99,
                        width=300,
                        height=450,
                        orientation="portrait",
                        style="collage",
                        theme="colorful",
                        rating=4.6,
                        is_featured=False,
                    ),
                ]
                session.add_all(posters)
                await session.flush()
                print(f"✅ Created {len(posters)} sample posters")
                
                # Create poster tags
                tags = [
                    PosterTag(poster_id=posters[0].id, tag="cyberpunk"),
                    PosterTag(poster_id=posters[0].id, tag="neon"),
                    PosterTag(poster_id=posters[1].id, tag="gaming"),
                    PosterTag(poster_id=posters[1].id, tag="esports"),
                    PosterTag(poster_id=posters[2].id, tag="zen"),
                    PosterTag(poster_id=posters[2].id, tag="minimalist"),
                    PosterTag(poster_id=posters[3].id, tag="luxury"),
                    PosterTag(poster_id=posters[3].id, tag="gold"),
                    PosterTag(poster_id=posters[4].id, tag="anime"),
                    PosterTag(poster_id=posters[4].id, tag="manga"),
                    PosterTag(poster_id=posters[5].id, tag="movies"),
                    PosterTag(poster_id=posters[5].id, tag="cinema"),
                    PosterTag(poster_id=posters[6].id, tag="music"),
                    PosterTag(poster_id=posters[6].id, tag="audio"),
                ]
                session.add_all(tags)
                await session.flush()
                print(f"✅ Created {len(tags)} poster tags")
            else:
                print(f"⏭️  Categories already exist ({len(existing_categories)} found), skipping seed data")
            
            await session.commit()
            print("✅ Database seeding completed!")
        
        print("\n✨ Database initialization completed successfully!")
        print("🎉 Your WallCraft AI database is ready to use!")
        
    except Exception as e:
        print(f"\n❌ Error initializing database: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 WallCraft AI - Database Initialization")
    print("=" * 60)
    asyncio.run(init_db())
