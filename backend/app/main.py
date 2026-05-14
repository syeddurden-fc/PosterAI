"""FastAPI application factory"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import os

from app.core.config import get_settings
from app.middleware.cors import setup_cors
from app.observability.logging import setup_logging
from app.observability.tracing import setup_tracing
from app.workers.cleanup_worker import run_cleanup_worker
from app.api.routes import auth, poster, cart, order, payment, ai

settings = get_settings()
logger = setup_logging()
tracer = setup_tracing()

# Background tasks
cleanup_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    global cleanup_task

    # Startup
    logger.info(f"Starting {settings.APP_NAME} backend (Environment: {settings.ENVIRONMENT})")
    cleanup_task = asyncio.create_task(run_cleanup_worker())

    yield

    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME} backend")
    if cleanup_task:
        cleanup_task.cancel()


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""

    app = FastAPI(
        title=settings.APP_NAME,
        description="AI-powered poster ecommerce backend",
        version="0.1.0",
        lifespan=lifespan,
        debug=settings.DEBUG,
    )

    # Setup CORS
    setup_cors(app)

    # Include routes
    app.include_router(auth.router)
    app.include_router(poster.router)
    app.include_router(cart.router)
    app.include_router(order.router)
    app.include_router(payment.router)
    app.include_router(ai.router)

    # Health check
    @app.get("/health")
    async def health_check():
        return {
            "status": "ok",
            "app": settings.APP_NAME,
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
        }

    # Root endpoint
    @app.get("/")
    async def root():
        return {
            "message": f"Welcome to {settings.APP_NAME}",
            "version": "0.1.0",
            "docs": "/docs",
            "environment": settings.ENVIRONMENT,
        }

    # Exception handlers
    @app.exception_handler(ValueError)
    async def value_error_handler(request, exc):
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc)},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        logger.error(f"Unhandled exception: {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return app


app = create_app()
