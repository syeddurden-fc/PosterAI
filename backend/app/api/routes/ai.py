"""AI routes"""
from fastapi import APIRouter, HTTPException, status, Header, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import os
import shutil
from pydantic import BaseModel
from typing import Optional, Any, Dict

from app.schemas.ai import (
    AIRoomSessionResponse,
    AILayoutResponse,
    GenerateLayoutRequest,
    RegenerateLayoutRequest,
    RenderPreviewRequest,
)
from app.services.ai import AIService
from app.db.session import get_db
from app.core.security import decode_token
from app.core.config import get_settings
from app.observability.logging import setup_logging
from fastapi import Depends

router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()
logger = setup_logging()


class LogEventRequest(BaseModel):
    """Request model for logging events from frontend"""
    event_type: str
    user_id: Optional[int] = None
    session_id: Optional[int] = None
    layout_id: Optional[int] = None
    duration_ms: Optional[float] = None
    status: str = "success"
    metadata: Optional[Dict[str, Any]] = None
    message: str = ""


def get_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Extract user ID from authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        return int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


@router.post("/upload-room", response_model=AIRoomSessionResponse)
async def upload_room(
    file: UploadFile = File(...),
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Upload room image and create AI session"""
    try:
        # Validate file
        if not file.content_type.startswith("image/"):
            raise ValueError("File must be an image")

        # Save file
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, f"room_{user_id}_{file.filename}")

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Create session
        service = AIService(session)
        result = await service.create_session(user_id, file_path)
        await session.commit()
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/generate-layout", response_model=AILayoutResponse)
async def generate_layout(
    request: GenerateLayoutRequest,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Generate layout for session"""
    try:
        service = AIService(session)
        result = await service.generate_layout(request, user_id)
        await session.commit()
        return result
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/regenerate-layout", response_model=AILayoutResponse)
async def regenerate_layout(
    request: RegenerateLayoutRequest,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Regenerate layout with variations"""
    try:
        service = AIService(session)
        result = await service.regenerate_layout(request)
        await session.commit()
        return result
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/render-preview")
async def render_preview(
    request: RenderPreviewRequest,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Render preview image"""
    try:
        service = AIService(session)
        preview_path = await service.render_preview(request)
        await session.commit()
        return {"preview_path": preview_path}
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/session/{session_id}", response_model=AIRoomSessionResponse)
async def get_session(
    session_id: int,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Get session details"""
    try:
        service = AIService(session)
        return await service.get_session(session_id)
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


@router.get("/layouts/{session_id}", response_model=list[AILayoutResponse])
async def get_layouts(
    session_id: int,
    user_id: int = Depends(get_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Get all layouts for session"""
    try:
        service = AIService(session)
        return await service.get_layouts(session_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/log-event")
async def log_event(
    request: LogEventRequest,
    user_id: int = Depends(get_user_id),
):
    """Log event from frontend"""
    try:
        logger.log_event(
            event_type=request.event_type,
            level="INFO",
            user_id=request.user_id or user_id,
            session_id=request.session_id,
            layout_id=request.layout_id,
            duration_ms=request.duration_ms,
            status=request.status,
            metadata=request.metadata,
            message=request.message,
        )
        return {"status": "logged"}
    except Exception as e:
        logger.error(f"Failed to log event: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log event",
        )
