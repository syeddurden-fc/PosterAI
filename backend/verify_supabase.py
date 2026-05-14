#!/usr/bin/env python3
"""Verify Supabase PostgreSQL connection"""
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def verify_connection():
    """Test Supabase connection"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not set in .env")
        return False
    
    print(f"📍 Database URL: {database_url[:50]}...")
    
    try:
        engine = create_async_engine(database_url, echo=False)
        
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version();"))
            version = result.scalar()
            print(f"✅ Connected to Supabase PostgreSQL")
            print(f"📊 Version: {version[:60]}...")
            
            # Check if tables exist
            result = await conn.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = result.fetchall()
            print(f"📋 Tables found: {len(tables)}")
            for table in tables:
                print(f"   - {table[0]}")
            
            return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False
    finally:
        await engine.dispose()

if __name__ == "__main__":
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    success = asyncio.run(verify_connection())
    exit(0 if success else 1)
