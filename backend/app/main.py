"""
Main entry point for the orderapp backend server.
Configures lifespan events, mounts CORS middleware, registers exception handlers,
and registers API routers.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.error_handlers import register_error_handlers
from app.api.v1.router import api_router
from app.db.init_db import init_db
from app.core.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages application startup and shutdown lifecycles.
    Executes database table creation and seeding on boot.
    """
    try:
        logger.info("Running startup tasks: seeding database...")
        await init_db()
        logger.info("Startup database seeding completed.")
    except Exception as e:
        logger.error(f"Failed to seed database on startup: {str(e)}", exc_info=True)
    yield
    logger.info("Shutting down FastAPI app...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_origin_regex="https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

register_error_handlers(app)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Order Management System API",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
