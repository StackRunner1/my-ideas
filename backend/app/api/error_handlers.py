"""Global exception handlers for FastAPI application.

Catches all exceptions and returns standardized error responses with request IDs.
"""

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from ..core.errors import APIError
from ..core.logging import get_logger

logger = get_logger(__name__)


def get_request_id(request: Request) -> str:
    """Extract request ID from request state."""
    return getattr(request.state, "request_id", "unknown")


async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    """Handle custom APIError exceptions.

    Returns standardized error response with request ID.
    """
    request_id = get_request_id(request)

    # Log error with full context
    logger.error(
        f"API Error: {exc.code} - {exc.message}",
        extra={
            "extra_data": {
                "code": exc.code,
                "status_code": exc.status_code,
                "details": exc.details,
                "path": request.url.path,
            }
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "request_id": request_id,
            }
        },
    )


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Handle Starlette HTTP exceptions.

    Converts HTTP exceptions to standardized error format.
    """
    request_id = get_request_id(request)

    # Map status code to error code
    code_map = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        405: "method_not_allowed",
        422: "validation_error",
        500: "server_error",
    }
    code = code_map.get(exc.status_code, "error")

    # Log error
    logger.error(
        f"HTTP Exception: {exc.status_code} - {exc.detail}",
        extra={
            "extra_data": {
                "status_code": exc.status_code,
                "detail": exc.detail,
                "path": request.url.path,
            }
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code,
                "message": str(exc.detail),
                "details": {},
                "request_id": request_id,
            }
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors.

    Returns detailed validation error information.
    """
    request_id = get_request_id(request)

    # Extract validation errors
    errors = exc.errors()

    # Log validation error
    logger.warning(
        f"Validation error: {len(errors)} field(s) failed",
        extra={"extra_data": {"errors": errors, "path": request.url.path}},
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "validation_error",
                "message": "Request validation failed",
                "details": {"errors": errors},
                "request_id": request_id,
            }
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all uncaught exceptions.

    Logs full stack trace but returns generic error to client.
    NEVER expose internal errors or stack traces to clients.
    """
    request_id = get_request_id(request)

    # Log full exception with stack trace
    logger.error(
        f"Unhandled exception: {type(exc).__name__}",
        extra={
            "extra_data": {
                "exception_type": type(exc).__name__,
                "exception_message": str(exc),
                "path": request.url.path,
            }
        },
        exc_info=True,  # Include stack trace in logs
    )

    # Return generic error to client (no internal details)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "server_error",
                "message": "An unexpected error occurred. Please try again later.",
                "details": {},
                "request_id": request_id,
            }
        },
    )
