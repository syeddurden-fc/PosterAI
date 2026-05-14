"""Wall detection using OpenCV"""
import cv2
import numpy as np
from pathlib import Path
from typing import Optional, Tuple


class WallDetector:
    """Detect wall area and color from room image"""

    @staticmethod
    def detect_wall_color(image_path: str) -> str:
        """Detect dominant wall color from image"""
        image = cv2.imread(image_path)
        if image is None:
            return "#808080"  # Default gray

        # Convert to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Resize for faster processing
        image_small = cv2.resize(image_rgb, (100, 100))

        # Reshape to 2D array of pixels
        pixels = image_small.reshape(-1, 3)

        # Use k-means to find dominant colors
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        _, _, centers = cv2.kmeans(
            np.float32(pixels), 1, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS
        )

        # Get dominant color
        dominant_color = centers[0].astype(int)
        hex_color = "#{:02x}{:02x}{:02x}".format(
            dominant_color[0], dominant_color[1], dominant_color[2]
        )
        return hex_color

    @staticmethod
    def detect_wall_area(image_path: str) -> Tuple[int, int, int, int]:
        """Detect wall area boundaries (x, y, width, height)"""
        image = cv2.imread(image_path)
        if image is None:
            return (0, 0, 0, 0)

        height, width = image.shape[:2]

        # Simple heuristic: assume wall occupies center 70% of image
        margin_x = int(width * 0.15)
        margin_y = int(height * 0.15)

        wall_x = margin_x
        wall_y = margin_y
        wall_width = width - (2 * margin_x)
        wall_height = height - (2 * margin_y)

        return (wall_x, wall_y, wall_width, wall_height)

    @staticmethod
    def get_image_dimensions(image_path: str) -> Tuple[int, int]:
        """Get image dimensions"""
        try:
            # Check if file exists
            if not Path(image_path).exists():
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Failed to read image: {image_path}")
            
            height, width = image.shape[:2]
            
            # Validate dimensions
            if width <= 0 or height <= 0:
                raise ValueError(f"Invalid image dimensions: {width}x{height}")
            
            return (width, height)
        except Exception as e:
            raise ValueError(f"Error getting image dimensions: {str(e)}")

    @staticmethod
    def detect_obstructions(image_path: str) -> bool:
        """Detect wall obstructions like plugs, outlets, switches"""
        try:
            image = cv2.imread(image_path)
            if image is None:
                return False

            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Apply edge detection
            edges = cv2.Canny(gray, 100, 200)

            # Look for rectangular shapes (typical of outlets/switches)
            contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

            # Check for rectangular contours that might be obstructions
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                
                # Look for small rectangular shapes (typical outlet/switch size)
                # Outlets are typically 2-3 inches, which is ~100-150 pixels at typical resolution
                if 50 < w < 200 and 50 < h < 200:
                    # Check if it's roughly square (outlet/switch characteristic)
                    aspect_ratio = float(w) / h if h > 0 else 0
                    if 0.7 < aspect_ratio < 1.3:
                        # Check if it's in the center area of the wall (where posters would go)
                        center_x = x + w / 2
                        center_y = y + h / 2
                        
                        # If obstruction is in the central 60% of the image
                        img_height, img_width = image.shape[:2]
                        if (0.2 * img_width < center_x < 0.8 * img_width and
                            0.2 * img_height < center_y < 0.8 * img_height):
                            return True

            return False
        except Exception:
            # If detection fails, assume no obstructions
            return False
