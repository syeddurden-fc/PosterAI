"""Structured logging setup"""
import logging
import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging"""

    def format(self, record):
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add custom fields if present
        if hasattr(record, "event_type"):
            log_data["event_type"] = record.event_type
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "session_id"):
            log_data["session_id"] = record.session_id
        if hasattr(record, "layout_id"):
            log_data["layout_id"] = record.layout_id
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
        if hasattr(record, "status"):
            log_data["status"] = record.status
        if hasattr(record, "metadata"):
            log_data["metadata"] = record.metadata

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


class StructuredLogger:
    """Wrapper for structured logging with context"""

    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def info(self, message: str, **kwargs):
        """Log info level message"""
        self.logger.info(message, extra=kwargs)

    def error(self, message: str, **kwargs):
        """Log error level message"""
        self.logger.error(message, extra=kwargs)

    def warning(self, message: str, **kwargs):
        """Log warning level message"""
        self.logger.warning(message, extra=kwargs)

    def debug(self, message: str, **kwargs):
        """Log debug level message"""
        self.logger.debug(message, extra=kwargs)

    def log_event(
        self,
        event_type: str,
        level: str = "INFO",
        user_id: Optional[int] = None,
        session_id: Optional[int] = None,
        layout_id: Optional[int] = None,
        duration_ms: Optional[float] = None,
        status: str = "success",
        metadata: Optional[Dict[str, Any]] = None,
        message: str = "",
    ):
        """Log a structured event"""
        record = logging.LogRecord(
            name=self.logger.name,
            level=getattr(logging, level),
            pathname="",
            lineno=0,
            msg=message or event_type,
            args=(),
            exc_info=None,
        )
        record.event_type = event_type
        record.user_id = user_id
        record.session_id = session_id
        record.layout_id = layout_id
        record.duration_ms = duration_ms
        record.status = status
        record.metadata = metadata or {}

        self.logger.handle(record)

    def log_ai_generation_started(
        self,
        user_id: int,
        session_id: int,
        poster_ids: list,
        layout_preset: str,
    ):
        """Log AI layout generation started"""
        self.log_event(
            event_type="ai_generation_started",
            level="INFO",
            user_id=user_id,
            session_id=session_id,
            metadata={
                "poster_ids": poster_ids,
                "layout_preset": layout_preset,
                "poster_count": len(poster_ids),
            },
            message=f"AI layout generation started for session {session_id}",
        )

    def log_ai_generation_completed(
        self,
        user_id: int,
        session_id: int,
        layout_id: int,
        duration_ms: float,
        wall_color: str,
        wall_dimensions: Dict[str, int],
        layout_preset: str,
    ):
        """Log AI layout generation completed"""
        self.log_event(
            event_type="ai_generation_completed",
            level="INFO",
            user_id=user_id,
            session_id=session_id,
            layout_id=layout_id,
            duration_ms=duration_ms,
            status="success",
            metadata={
                "wall_color": wall_color,
                "wall_dimensions": wall_dimensions,
                "layout_preset": layout_preset,
            },
            message=f"AI layout {layout_id} generated in {duration_ms}ms",
        )

    def log_ai_generation_failed(
        self,
        user_id: int,
        session_id: int,
        error_type: str,
        error_message: str,
        duration_ms: Optional[float] = None,
    ):
        """Log AI layout generation failed"""
        self.log_event(
            event_type="ai_generation_failed",
            level="ERROR",
            user_id=user_id,
            session_id=session_id,
            duration_ms=duration_ms,
            status="failed",
            metadata={
                "error_type": error_type,
                "error_message": error_message,
            },
            message=f"AI layout generation failed: {error_message}",
        )

    def log_wall_detection(
        self,
        user_id: int,
        session_id: int,
        wall_color: str,
        wall_dimensions: Dict[str, int],
        duration_ms: float,
    ):
        """Log wall detection results"""
        self.log_event(
            event_type="wall_detection_completed",
            level="INFO",
            user_id=user_id,
            session_id=session_id,
            duration_ms=duration_ms,
            metadata={
                "wall_color": wall_color,
                "wall_dimensions": wall_dimensions,
            },
            message=f"Wall detected: {wall_color}",
        )

    def log_preview_rendering_started(
        self,
        user_id: int,
        session_id: int,
        layout_id: int,
    ):
        """Log preview rendering started"""
        self.log_event(
            event_type="preview_rendering_started",
            level="INFO",
            user_id=user_id,
            session_id=session_id,
            layout_id=layout_id,
            message=f"Preview rendering started for layout {layout_id}",
        )

    def log_preview_rendering_completed(
        self,
        user_id: int,
        session_id: int,
        layout_id: int,
        duration_ms: float,
        preview_path: str,
    ):
        """Log preview rendering completed"""
        self.log_event(
            event_type="preview_rendering_completed",
            level="INFO",
            user_id=user_id,
            session_id=session_id,
            layout_id=layout_id,
            duration_ms=duration_ms,
            status="success",
            metadata={
                "preview_path": preview_path,
            },
            message=f"Preview rendered in {duration_ms}ms",
        )


def setup_logging():
    """Setup structured logging"""
    logger = logging.getLogger("wallcraft_ai")
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)

    return StructuredLogger(logger)
