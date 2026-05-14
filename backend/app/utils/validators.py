"""Validation utilities"""
import os
from app.core.config import get_settings

settings = get_settings()


def validate_image_file(file_path: str) -> bool:
    """Validate image file"""
    if not os.path.exists(file_path):
        return False

    file_size = os.path.getsize(file_path)
    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if file_size > max_size:
        return False

    # Check file extension
    valid_extensions = [".jpg", ".jpeg", ".png", ".webp"]
    _, ext = os.path.splitext(file_path)
    return ext.lower() in valid_extensions


def validate_poster_data(data: dict) -> bool:
    """Validate poster data"""
    required_fields = [
        "title",
        "image_url",
        "category_id",
        "price",
        "width",
        "height",
        "orientation",
        "style",
        "theme",
    ]

    for field in required_fields:
        if field not in data or data[field] is None:
            return False

    return True
