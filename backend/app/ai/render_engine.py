"""Render engine for creating preview images"""
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import cv2
import numpy as np
from typing import Optional
from app.core.config import get_settings

settings = get_settings()


class RenderEngine:
    """Render poster arrangements onto wall images"""

    @staticmethod
    def render_preview(
        wall_image_path: str,
        poster_images: dict[int, str],
        placements: list[dict],
        output_path: str,
    ) -> str:
        """Render posters onto wall image"""

        # Load wall image
        wall_image = Image.open(wall_image_path).convert("RGB")
        wall_width, wall_height = wall_image.size

        # Create a copy for rendering
        rendered = wall_image.copy()

        # Render each poster
        for placement in placements:
            poster_id = placement["poster_id"]
            if poster_id not in poster_images:
                continue

            poster_path = poster_images[poster_id]
            if not os.path.exists(poster_path):
                continue

            try:
                # Load poster image
                poster = Image.open(poster_path).convert("RGB")

                # Resize to placement dimensions
                poster = poster.resize(
                    (placement["width"], placement["height"]), Image.Resampling.LANCZOS
                )

                # Apply rotation if needed
                if placement.get("rotation", 0) != 0:
                    poster = poster.rotate(
                        placement["rotation"], expand=False, fillcolor=(255, 255, 255)
                    )

                # Create shadow effect
                shadow = Image.new(
                    "RGBA", poster.size, (0, 0, 0, 0)
                )
                shadow_draw = ImageDraw.Draw(shadow)
                shadow_draw.rectangle(
                    [(0, 0), poster.size], fill=(0, 0, 0, 100)
                )
                shadow = shadow.filter(ImageFilter.GaussianBlur(radius=8))

                # Paste shadow
                rendered.paste(
                    shadow,
                    (placement["x"] + 5, placement["y"] + 5),
                    shadow,
                )

                # Paste poster
                rendered.paste(
                    poster,
                    (placement["x"], placement["y"]),
                )

            except Exception as e:
                print(f"Error rendering poster {poster_id}: {e}")
                continue

        # Save rendered image
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        rendered.save(output_path, quality=int(os.getenv("RENDER_QUALITY", "95")))

        return output_path

    @staticmethod
    def create_thumbnail(image_path: str, size: tuple = (300, 300)) -> str:
        """Create thumbnail of image"""
        image = Image.open(image_path)
        image.thumbnail(size, Image.Resampling.LANCZOS)

        # Save thumbnail
        thumb_path = image_path.replace(".jpg", "_thumb.jpg").replace(".png", "_thumb.png")
        image.save(thumb_path, quality=int(os.getenv("THUMBNAIL_QUALITY", "85")))

        return thumb_path

    @staticmethod
    def apply_filter(image_path: str, filter_type: str = "blur") -> str:
        """Apply filter to image"""
        image = Image.open(image_path)

        if filter_type == "blur":
            image = image.filter(ImageFilter.GaussianBlur(radius=5))
        elif filter_type == "sharpen":
            image = image.filter(ImageFilter.SHARPEN)
        elif filter_type == "enhance":
            from PIL import ImageEnhance
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.5)

        # Save filtered image
        filtered_path = image_path.replace(".jpg", "_filtered.jpg").replace(".png", "_filtered.png")
        image.save(filtered_path, quality=int(os.getenv("RENDER_QUALITY", "95")))

        return filtered_path
