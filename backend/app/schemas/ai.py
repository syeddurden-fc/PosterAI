"""AI schemas"""
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class PosterPlacement(BaseModel):
    """Poster placement in layout"""

    poster_id: int
    x: int
    y: int
    width: int
    height: int
    rotation: float = 0.0


class LayoutMetadata(BaseModel):
    """Layout metadata"""

    layout_type: str
    wall_color: str
    placements: list[PosterPlacement]
    wall_width: int
    wall_height: int


class AIRoomSessionResponse(BaseModel):
    """AI room session response"""

    id: int
    user_id: int
    wall_image_path: str
    wall_color: Optional[str] = None
    layout_style: Optional[str] = None
    status: str
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


class AILayoutResponse(BaseModel):
    """AI layout response"""

    id: int
    session_id: int
    layout_type: str
    layout_metadata_json: str
    generated_preview_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class GenerateLayoutRequest(BaseModel):
    """Generate layout request"""

    session_id: int
    poster_ids: list[int]
    layout_preset: str  # minimal_grid, cinematic, anime_collage, etc


class RegenerateLayoutRequest(BaseModel):
    """Regenerate layout request"""

    session_id: int
    layout_id: int


class RenderPreviewRequest(BaseModel):
    """Render preview request"""

    session_id: int
    layout_id: int
