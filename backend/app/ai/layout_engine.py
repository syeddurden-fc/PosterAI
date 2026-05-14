"""Layout engine for generating poster arrangements"""
import json
import random
from typing import Optional
from app.schemas.ai import PosterPlacement, LayoutMetadata


class LayoutEngine:
    """Generate poster layout arrangements"""

    LAYOUT_PRESETS = {
        "minimal_grid": {
            "name": "Minimal Grid",
            "description": "Clean grid arrangement",
        },
        "cinematic": {
            "name": "Cinematic",
            "description": "Dramatic asymmetric layout",
        },
        "anime_collage": {
            "name": "Anime Collage",
            "description": "Overlapping collage style",
        },
        "luxury_symmetry": {
            "name": "Luxury Symmetry",
            "description": "Perfectly balanced symmetry",
        },
        "floating_cluster": {
            "name": "Floating Cluster",
            "description": "Scattered floating arrangement",
        },
        "pinterest_style": {
            "name": "Pinterest Style",
            "description": "Masonry-like layout",
        },
        "gaming_setup": {
            "name": "Gaming Setup",
            "description": "Gaming-focused arrangement",
        },
        "music_studio": {
            "name": "Music Studio",
            "description": "Music-themed layout",
        },
    }

    @staticmethod
    def generate_layout(
        poster_ids: list[int],
        layout_preset: str,
        wall_width: int,
        wall_height: int,
        wall_color: str,
    ) -> LayoutMetadata:
        """Generate layout for given posters"""

        placements = []

        if layout_preset == "minimal_grid":
            placements = LayoutEngine._minimal_grid(
                poster_ids, wall_width, wall_height
            )
        elif layout_preset == "cinematic":
            placements = LayoutEngine._cinematic(poster_ids, wall_width, wall_height)
        elif layout_preset == "anime_collage":
            placements = LayoutEngine._anime_collage(
                poster_ids, wall_width, wall_height
            )
        elif layout_preset == "luxury_symmetry":
            placements = LayoutEngine._luxury_symmetry(
                poster_ids, wall_width, wall_height
            )
        elif layout_preset == "floating_cluster":
            placements = LayoutEngine._floating_cluster(
                poster_ids, wall_width, wall_height
            )
        elif layout_preset == "pinterest_style":
            placements = LayoutEngine._pinterest_style(
                poster_ids, wall_width, wall_height
            )
        elif layout_preset == "gaming_setup":
            placements = LayoutEngine._gaming_setup(
                poster_ids, wall_width, wall_height
            )
        elif layout_preset == "music_studio":
            placements = LayoutEngine._music_studio(
                poster_ids, wall_width, wall_height
            )
        else:
            placements = LayoutEngine._minimal_grid(
                poster_ids, wall_width, wall_height
            )

        return LayoutMetadata(
            layout_type=layout_preset,
            wall_color=wall_color,
            placements=placements,
            wall_width=wall_width,
            wall_height=wall_height,
        )

    @staticmethod
    def _minimal_grid(
        poster_ids: list[int], wall_width: int, wall_height: int
    ) -> list[PosterPlacement]:
        """Minimal grid layout with proportional sizing - NO OVERLAPS"""
        placements = []
        cols = 2 if len(poster_ids) <= 4 else 3
        rows = (len(poster_ids) + cols - 1) // cols

        # A3 aspect ratio: 1.41
        a3_aspect_ratio = 420 / 297
        
        # Calculate maximum poster size that fits without overlapping
        # Leave 10% margin on each side, divide remaining space by cols/rows
        available_width = wall_width * 0.80  # 80% of wall (10% margin each side)
        available_height = wall_height * 0.80  # 80% of wall (10% margin each side)
        
        # Calculate max size based on grid
        max_width_per_poster = available_width / cols
        max_height_per_poster = available_height / rows
        
        # Apply A3 aspect ratio
        poster_width = int(max_width_per_poster * 0.95)  # 95% to leave padding
        poster_height = int(poster_width * a3_aspect_ratio)
        
        # If height exceeds available, reduce width
        if poster_height > max_height_per_poster:
            poster_height = int(max_height_per_poster * 0.95)
            poster_width = int(poster_height / a3_aspect_ratio)
        
        # Calculate padding
        padding = int(wall_width * 0.01)  # 1% padding
        
        # Calculate grid dimensions
        grid_width = cols * poster_width + (cols - 1) * padding
        grid_height = rows * poster_height + (rows - 1) * padding
        
        # Center the grid on the wall
        margin_x = (wall_width - grid_width) // 2
        margin_y = (wall_height - grid_height) // 2

        for idx, poster_id in enumerate(poster_ids):
            row = idx // cols
            col = idx % cols
            x = margin_x + col * (poster_width + padding)
            y = margin_y + row * (poster_height + padding)

            placements.append(
                PosterPlacement(
                    poster_id=poster_id,
                    x=x,
                    y=y,
                    width=poster_width,
                    height=poster_height,
                    rotation=0,
                )
            )

        return placements

    @staticmethod
    def _cinematic(
        poster_ids: list[int], wall_width: int, wall_height: int
    ) -> list[PosterPlacement]:
        """Cinematic asymmetric layout - NO OVERLAPS"""
        placements = []

        if len(poster_ids) == 0:
            return placements

        # A3 aspect ratio: 1.41
        a3_aspect_ratio = 420 / 297
        
        # Leave 10% margin on each side
        available_width = wall_width * 0.80
        available_height = wall_height * 0.80
        margin_x = wall_width * 0.10
        margin_y = wall_height * 0.10

        # Large poster on left (40% of available width)
        large_width = int(available_width * 0.40)
        large_height = int(large_width * a3_aspect_ratio)
        
        # Adjust if too tall
        if large_height > available_height:
            large_height = int(available_height)
            large_width = int(large_height / a3_aspect_ratio)
        
        placements.append(
            PosterPlacement(
                poster_id=poster_ids[0],
                x=int(margin_x),
                y=int(margin_y),
                width=large_width,
                height=large_height,
                rotation=0,
            )
        )

        # Smaller posters on right (2x2 grid)
        remaining = poster_ids[1:]
        right_available_width = available_width - large_width - int(wall_width * 0.02)
        small_width = int(right_available_width / 2 * 0.95)
        small_height = int(small_width * a3_aspect_ratio)
        
        # Adjust if too tall
        if small_height * 2 > available_height:
            small_height = int(available_height / 2 * 0.95)
            small_width = int(small_height / a3_aspect_ratio)

        padding = int(wall_width * 0.01)
        right_start_x = margin_x + large_width + padding

        for idx, poster_id in enumerate(remaining[:4]):
            row = idx // 2
            col = idx % 2
            x = right_start_x + col * (small_width + padding)
            y = margin_y + row * (small_height + padding)

            placements.append(
                PosterPlacement(
                    poster_id=poster_id,
                    x=x,
                    y=y,
                    width=small_width,
                    height=small_height,
                    rotation=0,
                )
            )

        return placements

    @staticmethod
    def _anime_collage(
        poster_ids: list[int], wall_width: int, wall_height: int
    ) -> list[PosterPlacement]:
        """Gallery wall with varied sizing"""
        placements = []
        
        # A3 aspect ratio: 1.41
        a3_aspect_ratio = 420 / 297

        # Create a varied gallery wall with different sized posters
        sizes = [0.25, 0.20, 0.18, 0.22, 0.20, 0.18]  # Percentages of wall width
        padding = int(wall_width * 0.02)
        
        x_pos = int(wall_width * 0.05)
        y_pos = int(wall_height * 0.05)
        max_y = y_pos

        for idx, poster_id in enumerate(poster_ids[:6]):
            size_pct = sizes[idx % len(sizes)]
            poster_width = int(wall_width * size_pct)
            poster_height = int(poster_width * a3_aspect_ratio)
            
            # Wrap to next row if needed
            if x_pos + poster_width > wall_width * 0.95:
                x_pos = int(wall_width * 0.05)
                y_pos = max_y + padding

            placements.append(
                PosterPlacement(
                    poster_id=poster_id,
                    x=x_pos,
                    y=y_pos,
                    width=poster_width,
                    height=poster_height,
                    rotation=0,
                )
            )

            x_pos += poster_width + padding
            max_y = max(max_y, y_pos + poster_height)

        return placements

    @staticmethod
    def _luxury_symmetry(
        poster_ids: list[int], wall_width: int, wall_height: int
    ) -> list[PosterPlacement]:
        """Perfectly balanced symmetry - NO OVERLAPS"""
        placements = []

        if len(poster_ids) == 0:
            return placements

        # A3 aspect ratio: 1.41
        a3_aspect_ratio = 420 / 297
        
        # Leave 10% margin
        available_width = wall_width * 0.80
        available_height = wall_height * 0.80
        margin_x = wall_width * 0.10
        margin_y = wall_height * 0.10

        center_x = margin_x + available_width / 2
        center_y = margin_y + available_height / 2

        # Center poster (30% of available width)
        center_width = int(available_width * 0.30)
        center_height = int(center_width * a3_aspect_ratio)
        
        placements.append(
            PosterPlacement(
                poster_id=poster_ids[0],
                x=int(center_x - center_width // 2),
                y=int(center_y - center_height // 2),
                width=center_width,
                height=center_height,
                rotation=0,
            )
        )

        # Symmetric side posters (20% of available width each)
        side_width = int(available_width * 0.20)
        side_height = int(side_width * a3_aspect_ratio)
        padding = int(wall_width * 0.01)
        remaining = poster_ids[1:]

        for idx, poster_id in enumerate(remaining[:4]):
            if idx < 2:
                # Top
                x = int(center_x - (side_width + padding)) if idx == 0 else int(center_x + padding)
                y = int(margin_y)
            else:
                # Bottom
                x = int(center_x - (side_width + padding)) if idx == 2 else int(center_x + padding)
                y = int(margin_y + available_height - side_height)

            placements.append(
                PosterPlacement(
                    poster_id=poster_id,
                    x=x,
                    y=y,
                    width=side_width,
                    height=side_height,
                    rotation=0,
                )
            )

        return placements

    @staticmethod
    def _floating_cluster(
        poster_ids: list[int], wall_width: int, wall_height: int
    ) -> list[PosterPlacement]:
        """Scattered floating arrangement with proportional sizing"""
        placements = []
        
        # A3 aspect ratio: 1.41
        a3_aspect_ratio = 420 / 297

        # Create a balanced scattered layout
        for idx, poster_id in enumerate(poster_ids[:8]):
            # Vary sizes between 15-25% of wall width
            size_pct = 0.15 + (idx % 3) * 0.05
            poster_width = int(wall_width * size_pct)
            poster_height = int(poster_width * a3_aspect_ratio)
            
            # Distribute across wall in a balanced way
            col = idx % 3
            row = idx // 3
            
            x = int(wall_width * 0.05) + col * int(wall_width * 0.30)
            y = int(wall_height * 0.05) + row * int(wall_height * 0.40)
            
            # Add slight randomness to x position
            x += random.randint(-int(wall_width * 0.05), int(wall_width * 0.05))

            placements.append(
                PosterPlacement(
                    poster_id=poster_id,
                    x=max(0, x),
                    y=max(0, y),
                    width=poster_width,
                    height=poster_height,
                    rotation=random.randint(-5, 5),
                )
            )

        return placements

    @staticmethod
    def _pinterest_style(
        poster_ids: list[int], wall_width: int, wall_height: int
    ) -> list[PosterPlacement]:
        """Masonry-like layout - NO OVERLAPS"""
        placements = []
        cols = 3
        col_heights = [0] * cols
        
        # A3 aspect ratio: 1.41
        a3_aspect_ratio = 420 / 297
        
        # Leave 10% margin
        available_width = wall_width * 0.80
        available_height = wall_height * 0.80
        margin_x = wall_width * 0.10
        margin_y = wall_height * 0.10

        # Each column gets equal width
        col_width = int(available_width / cols * 0.95)
        padding = int(wall_width * 0.01)

        for poster_id in poster_ids[:12]:
            # Find column with minimum height
            min_col = col_heights.index(min(col_heights))

            x = margin_x + min_col * (col_width + padding)
            y = margin_y + col_heights[min_col]

            # Use A3 aspect ratio for consistent sizing
            poster_height = int(col_width * a3_aspect_ratio)
            
            # Check if poster fits in available height
            if y + poster_height > margin_y + available_height:
                # Skip if doesn't fit
                continue

            placements.append(
                PosterPlacement(
                    poster_id=poster_id,
                    x=int(x),
                    y=int(y),
                    width=col_width,
                    height=poster_height,
                    rotation=0,
                )
            )

            col_heights[min_col] += poster_height + padding

        return placements

    @staticmethod
    def _gaming_setup(
        poster_ids: list[int], wall_width: int, wall_height: int
    ) -> list[PosterPlacement]:
        """Gaming-focused arrangement - NO OVERLAPS"""
        placements = []

        if len(poster_ids) == 0:
            return placements

        # A3 aspect ratio: 1.41
        a3_aspect_ratio = 420 / 297
        
        # Leave 10% margin
        available_width = wall_width * 0.80
        available_height = wall_height * 0.80
        margin_x = wall_width * 0.10
        margin_y = wall_height * 0.10

        # Large center poster (50% of available width)
        center_width = int(available_width * 0.50)
        center_height = int(center_width * a3_aspect_ratio)
        
        # Adjust if too tall
        if center_height > available_height:
            center_height = int(available_height)
            center_width = int(center_height / a3_aspect_ratio)
        
        placements.append(
            PosterPlacement(
                poster_id=poster_ids[0],
                x=int(margin_x + (available_width - center_width) / 2),
                y=int(margin_y),
                width=center_width,
                height=center_height,
                rotation=0,
            )
        )

        # Side posters (2x2 grid on sides)
        side_width = int((available_width - center_width) / 2 * 0.95)
        side_height = int(side_width * a3_aspect_ratio)
        padding = int(wall_width * 0.01)
        
        # Adjust if too tall
        if side_height * 2 > available_height:
            side_height = int(available_height / 2 * 0.95)
            side_width = int(side_height / a3_aspect_ratio)

        for idx, poster_id in enumerate(poster_ids[1:5]):
            if idx < 2:
                x = margin_x if idx == 0 else margin_x + available_width - side_width
                y = margin_y
            else:
                x = margin_x if idx == 2 else margin_x + available_width - side_width
                y = margin_y + available_height - side_height

            placements.append(
                PosterPlacement(
                    poster_id=poster_id,
                    x=int(x),
                    y=int(y),
                    width=side_width,
                    height=side_height,
                    rotation=0,
                )
            )

        return placements

    @staticmethod
    def _music_studio(
        poster_ids: list[int], wall_width: int, wall_height: int
    ) -> list[PosterPlacement]:
        """Music-themed layout - NO OVERLAPS"""
        placements = []

        # A3 aspect ratio: 1.41
        a3_aspect_ratio = 420 / 297
        
        # Leave 10% margin
        available_width = wall_width * 0.80
        available_height = wall_height * 0.80
        margin_x = wall_width * 0.10
        margin_y = wall_height * 0.10

        # Diagonal arrangement (20% of available width per poster)
        for idx, poster_id in enumerate(poster_ids[:6]):
            size = int(available_width * 0.20)
            height = int(size * a3_aspect_ratio)
            x = margin_x + (available_width - size) * (idx / 5)
            y = margin_y + (available_height - height) * (idx / 5)

            placements.append(
                PosterPlacement(
                    poster_id=poster_id,
                    x=int(x),
                    y=int(y),
                    width=size,
                    height=height,
                    rotation=idx * 5,
                )
            )

        return placements
