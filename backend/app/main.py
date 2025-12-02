"""FastAPI application for the my-ideas backend.

Provides a minimal app with CORS and middleware that injects `x-request-id`
and `x-duration-ms` headers, and exposes a `/health` endpoint.
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from .api.error_handlers import (
    api_error_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from .api.routes import auth_router
from .core.errors import APIError
from .middleware.request_id import RequestIDTimingMiddleware


def create_app() -> FastAPI:
    app = FastAPI(title="my-ideas-api", version="0.1.0")

    # Register exception handlers
    app.add_exception_handler(APIError, api_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add request ID and timing middleware
    app.add_middleware(RequestIDTimingMiddleware)

    # Register routers
    app.include_router(auth_router, prefix="/api/v1")

    @app.get("/health")
    async def health(request: Request):
        """Health check endpoint with request ID and database connectivity test."""
        import time

        from .db.supabase_client import get_admin_client

        health_status = {
            "status": "ok",
            "request_id": getattr(request.state, "request_id", None),
            "database": "unknown",
            "latency_ms": None,
        }

        # Test database connectivity
        try:
            start = time.perf_counter()
            client = get_admin_client()
            # Simple query to test connection
            client.table("user_profiles").select("id").limit(1).execute()
            latency_ms = int((time.perf_counter() - start) * 1000)

            health_status["database"] = "connected"
            health_status["latency_ms"] = latency_ms
        except Exception as e:
            health_status["status"] = "degraded"
            health_status["database"] = "disconnected"
            health_status["error"] = str(e)

        return health_status

    return app


app = create_app()
