"""Request ID Middleware for end-to-end tracing.

Extracts or generates a unique request ID for each HTTP request,
stores it in request state, logging context, and includes it in response headers.
"""

import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from ..core.logging import clear_request_id, get_logger, set_request_id

logger = get_logger(__name__)


class RequestIDTimingMiddleware(BaseHTTPMiddleware):
    """Middleware that adds request ID and timing to all requests/responses.

    Features:
    - Extracts x-request-id from incoming headers or generates UUID if missing
    - Stores request ID in request.state for access in route handlers
    - Adds x-request-id to response headers for client correlation
    - Calculates request duration and adds x-duration-ms header
    """

    async def dispatch(self, request: Request, call_next):
        # Extract or generate request ID
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = request_id

        # Set request ID in logging context
        set_request_id(request_id)

        # Track request start time
        start = time.perf_counter()

        # Log request start
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "extra_data": {
                    "method": request.method,
                    "path": request.url.path,
                    "client": request.client.host if request.client else None,
                }
            },
        )

        try:
            # Process request
            response = await call_next(request)

            # Calculate duration
            duration_ms = int((time.perf_counter() - start) * 1000)

            # Log request completion
            logger.info(
                f"Request completed: {request.method} {request.url.path} -> {response.status_code}",
                extra={
                    "extra_data": {
                        "method": request.method,
                        "path": request.url.path,
                        "status_code": response.status_code,
                        "duration_ms": duration_ms,
                    }
                },
            )

            # Ensure headers can be set on the response
            if not isinstance(response, Response):
                response = Response(
                    content=response.body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                )

            # Add tracing headers
            response.headers["x-request-id"] = request_id
            response.headers["x-duration-ms"] = str(duration_ms)

            return response

        except Exception as e:
            # Log request error
            duration_ms = int((time.perf_counter() - start) * 1000)
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "extra_data": {
                        "method": request.method,
                        "path": request.url.path,
                        "duration_ms": duration_ms,
                        "error": str(e),
                    }
                },
                exc_info=True,
            )
            raise

        finally:
            # Clear request ID from logging context
            clear_request_id()
