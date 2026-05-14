"""AI service for room visualization"""
import os
import json
import time
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.ai import AIRoomSessionRepository, AILayoutRepository
from app.repositories.poster import PosterRepository
from app.ai.wall_detection import WallDetector
from app.ai.layout_engine import LayoutEngine
from app.ai.render_engine import RenderEngine
from app.schemas.ai import (
    AIRoomSessionResponse,
    AILayoutResponse,
    GenerateLayoutRequest,
    RegenerateLayoutRequest,
    RenderPreviewRequest,
)
from app.core.config import get_settings
from app.observability.logging import setup_logging

settings = get_settings()
logger = setup_logging()


class AIService:
    """AI service for room visualization"""

    def __init__(self, session: AsyncSession):
        self.session_repo = AIRoomSessionRepository(session)
        self.layout_repo = AILayoutRepository(session)
        self.poster_repo = PosterRepository(session)
        self.session = session

    async def create_session(self, user_id: int, wall_image_path: str) -> AIRoomSessionResponse:
        """Create new AI room session"""
        start_time = time.time()
        
        try:
            # Detect wall color
            wall_color = WallDetector.detect_wall_color(wall_image_path)
            wall_width, wall_height = WallDetector.get_image_dimensions(wall_image_path)
            
            detection_time = (time.time() - start_time) * 1000
            logger.log_wall_detection(
                user_id=user_id,
                session_id=0,  # Will be set after creation
                wall_color=wall_color,
                wall_dimensions={"width": wall_width, "height": wall_height},
                duration_ms=detection_time,
            )

            # Create session with expires_at set to naive datetime (no timezone)
            from datetime import timedelta
            expires_at = datetime.now() + timedelta(hours=settings.SESSION_EXPIRY_HOURS)
            
            session_obj = await self.session_repo.create(
                {
                    "user_id": user_id,
                    "wall_image_path": wall_image_path,
                    "wall_color": wall_color,
                    "status": "active",
                    "expires_at": expires_at,
                }
            )

            await self.session.flush()
            return AIRoomSessionResponse.model_validate(session_obj)
        except Exception as e:
            logger.log_event(
                event_type="session_creation_failed",
                level="ERROR",
                user_id=user_id,
                status="failed",
                metadata={"error": str(e)},
                message=f"Failed to create session: {str(e)}",
            )
            raise

    async def generate_layout(
        self, request: GenerateLayoutRequest, user_id: int = None
    ) -> AILayoutResponse:
        """Generate layout for session"""
        start_time = time.time()
        
        try:
            # Log generation started
            logger.log_ai_generation_started(
                user_id=user_id or 0,
                session_id=request.session_id,
                poster_ids=request.poster_ids,
                layout_preset=request.layout_preset,
            )
            
            # Get session
            session_obj = await self.session_repo.get_by_id(request.session_id)
            if not session_obj:
                raise ValueError("Session not found")

            # Validate wall image exists
            if not session_obj.wall_image_path:
                raise ValueError("Wall image path is missing")

            # Get wall dimensions
            try:
                wall_width, wall_height = WallDetector.get_image_dimensions(
                    session_obj.wall_image_path
                )
            except Exception as e:
                raise ValueError(f"Failed to get wall dimensions: {str(e)}")

            # Validate dimensions
            if wall_width <= 0 or wall_height <= 0:
                raise ValueError(f"Invalid wall dimensions: {wall_width}x{wall_height}")

            # Check for wall obstructions (plugs, outlets, etc.)
            try:
                obstruction_detected = WallDetector.detect_obstructions(
                    session_obj.wall_image_path
                )
                
                if obstruction_detected:
                    raise ValueError(
                        "Wall obstruction detected (plug point, outlet, etc.). "
                        "Please use a different wall or area without obstructions."
                    )
            except ValueError:
                raise
            except Exception as e:
                logger.log_event(
                    event_type="obstruction_detection_error",
                    level="WARNING",
                    session_id=request.session_id,
                    status="warning",
                    metadata={"error": str(e)},
                    message=f"Obstruction detection failed (continuing): {str(e)}",
                )

            # Generate layout
            try:
                layout_metadata = LayoutEngine.generate_layout(
                    request.poster_ids,
                    request.layout_preset,
                    wall_width,
                    wall_height,
                    session_obj.wall_color,
                )
            except Exception as e:
                raise ValueError(f"Layout generation failed: {str(e)}")

            # Save layout
            layout_obj = await self.layout_repo.create(
                {
                    "session_id": request.session_id,
                    "layout_type": request.layout_preset,
                    "layout_metadata_json": layout_metadata.model_dump_json(),
                    "generated_preview_path": None,
                }
            )

            await self.session.flush()
            
            # Log generation completed
            duration_ms = (time.time() - start_time) * 1000
            logger.log_ai_generation_completed(
                user_id=session_obj.user_id,
                session_id=request.session_id,
                layout_id=layout_obj.id,
                duration_ms=duration_ms,
                wall_color=session_obj.wall_color,
                wall_dimensions={"width": wall_width, "height": wall_height},
                layout_preset=request.layout_preset,
            )
            
            return AILayoutResponse.model_validate(layout_obj)
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.log_ai_generation_failed(
                user_id=user_id or 0,
                session_id=request.session_id,
                error_type=type(e).__name__,
                error_message=str(e),
                duration_ms=duration_ms,
            )
            raise

    async def regenerate_layout(
        self, request: RegenerateLayoutRequest
    ) -> AILayoutResponse:
        """Regenerate layout with variations"""
        start_time = time.time()
        
        try:
            # Get layout
            layout_obj = await self.layout_repo.get_by_id(request.layout_id)
            if not layout_obj:
                raise ValueError("Layout not found")

            # Parse metadata
            metadata = json.loads(layout_obj.layout_metadata_json)

            # Apply small variations to placements
            import random
            for placement in metadata["placements"]:
                placement["x"] += random.randint(-50, 50)
                placement["y"] += random.randint(-50, 50)

            # Update layout
            await self.layout_repo.update(
                request.layout_id,
                {"layout_metadata_json": json.dumps(metadata)},
            )

            await self.session.flush()
            
            # Log generation completed
            duration_ms = (time.time() - start_time) * 1000
            logger.log_event(
                event_type="layout_regenerated",
                level="INFO",
                session_id=request.session_id,
                layout_id=request.layout_id,
                duration_ms=duration_ms,
                status="success",
                message=f"Layout regenerated in {duration_ms}ms",
            )
            
            return AILayoutResponse.model_validate(layout_obj)
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.log_event(
                event_type="layout_regeneration_failed",
                level="ERROR",
                session_id=request.session_id,
                layout_id=request.layout_id,
                duration_ms=duration_ms,
                status="failed",
                metadata={
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                },
                message=f"Layout regeneration failed: {str(e)}",
            )
            raise

    async def render_preview(self, request: RenderPreviewRequest) -> str:
        """Render preview image"""
        start_time = time.time()
        
        try:
            # Get layout
            layout_obj = await self.layout_repo.get_by_id(request.layout_id)
            if not layout_obj:
                raise ValueError("Layout not found")

            # Get session
            session_obj = await self.session_repo.get_by_id(request.session_id)
            if not session_obj:
                raise ValueError("Session not found")

            # Log rendering started
            logger.log_preview_rendering_started(
                user_id=session_obj.user_id,
                session_id=request.session_id,
                layout_id=request.layout_id,
            )

            # Parse metadata
            metadata = json.loads(layout_obj.layout_metadata_json)

            # Get poster images
            poster_images = {}
            for placement in metadata["placements"]:
                poster_id = placement["poster_id"]
                poster = await self.poster_repo.get_by_id(poster_id)
                if poster:
                    poster_images[poster_id] = poster.image_url

            # Render preview
            output_dir = os.path.join(settings.TEMP_DIR, f"session_{request.session_id}")
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"preview_{request.layout_id}.jpg")

            preview_path = RenderEngine.render_preview(
                session_obj.wall_image_path,
                poster_images,
                metadata["placements"],
                output_path,
            )

            # Update layout with preview path
            await self.layout_repo.update(
                request.layout_id,
                {"generated_preview_path": preview_path},
            )

            await self.session.flush()
            
            # Log rendering completed
            duration_ms = (time.time() - start_time) * 1000
            logger.log_preview_rendering_completed(
                user_id=session_obj.user_id,
                session_id=request.session_id,
                layout_id=request.layout_id,
                duration_ms=duration_ms,
                preview_path=preview_path,
            )
            
            return preview_path
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.log_event(
                event_type="preview_rendering_failed",
                level="ERROR",
                session_id=request.session_id,
                layout_id=request.layout_id,
                duration_ms=duration_ms,
                status="failed",
                metadata={
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                },
                message=f"Preview rendering failed: {str(e)}",
            )
            raise

    async def get_session(self, session_id: int) -> AIRoomSessionResponse:
        """Get session details"""
        session_obj = await self.session_repo.get_by_id(session_id)
        if not session_obj:
            raise ValueError("Session not found")
        return AIRoomSessionResponse.model_validate(session_obj)

    async def get_layouts(self, session_id: int) -> list[AILayoutResponse]:
        """Get all layouts for session"""
        layouts = await self.layout_repo.get_session_layouts(session_id)
        return [AILayoutResponse.model_validate(l) for l in layouts]
