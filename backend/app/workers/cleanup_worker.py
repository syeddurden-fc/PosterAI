"""Cleanup worker for expired sessions and temporary files"""
import asyncio
import os
import shutil
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.repositories.ai import AIRoomSessionRepository
from app.core.config import get_settings

settings = get_settings()


async def cleanup_expired_sessions():
    """Clean up expired AI sessions and their files"""
    async with AsyncSessionLocal() as session:
        try:
            repo = AIRoomSessionRepository(session)

            # Get all expired sessions
            from sqlalchemy import select
            from app.models.ai import AIRoomSession

            query = select(AIRoomSession).where(
                AIRoomSession.expires_at < datetime.now(timezone.utc)
            )
            result = await session.execute(query)
            expired_sessions = result.scalars().all()

            for session_obj in expired_sessions:
                # Delete uploaded image
                if os.path.exists(session_obj.wall_image_path):
                    os.remove(session_obj.wall_image_path)

                # Delete session directory
                session_dir = os.path.join(
                    settings.TEMP_DIR, f"session_{session_obj.id}"
                )
                if os.path.exists(session_dir):
                    shutil.rmtree(session_dir)

                # Mark session as expired
                await repo.update(session_obj.id, {"status": "expired"})

            await session.commit()
            print(f"Cleaned up {len(expired_sessions)} expired sessions")

        except Exception as e:
            print(f"Error in cleanup worker: {e}")
            await session.rollback()


async def cleanup_unpaid_previews():
    """Clean up unpaid preview images older than configured hours"""
    try:
        temp_dir = settings.TEMP_DIR
        if not os.path.exists(temp_dir):
            return

        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(hours=settings.PREVIEW_CLEANUP_HOURS)

        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root, file)
                file_mtime = datetime.fromtimestamp(
                    os.path.getmtime(file_path), tz=timezone.utc
                )

                if file_mtime < cutoff_time:
                    os.remove(file_path)

        print("Cleaned up old preview files")

    except Exception as e:
        print(f"Error cleaning up previews: {e}")


async def run_cleanup_worker():
    """Run cleanup worker periodically"""
    while True:
        try:
            await cleanup_expired_sessions()
            await cleanup_unpaid_previews()
            # Run every hour (configurable via environment)
            cleanup_interval = int(os.getenv("CLEANUP_INTERVAL_HOURS", "1")) * 3600
            await asyncio.sleep(cleanup_interval)
        except Exception as e:
            print(f"Cleanup worker error: {e}")
            await asyncio.sleep(60)
