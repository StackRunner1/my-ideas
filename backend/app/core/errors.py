"""Custom exception classes for standardized error responses.

All custom exceptions follow a consistent error schema:
{
    "error": {
        "code": "error_code",
        "message": "Human-readable error message",
        "details": {},  # Optional extra context
        "request_id": "uuid"
    }
}
"""

from typing import Any, Dict, Optional


class APIError(Exception):
    """Base exception for all API errors.

    Attributes:
        code: Machine-readable error code (snake_case)
        message: Human-readable error message
        details: Optional dict with additional context
        status_code: HTTP status code to return
    """

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(APIError):
    """Resource not found (404)."""

    def __init__(
        self,
        message: str = "Resource not found",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="not_found",
            message=message,
            status_code=404,
            details=details,
        )


class ValidationError(APIError):
    """Request validation failed (422)."""

    def __init__(
        self,
        message: str = "Validation failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="validation_error",
            message=message,
            status_code=422,
            details=details,
        )


class UnauthorizedError(APIError):
    """Authentication required or token invalid (401)."""

    def __init__(
        self,
        message: str = "Authentication required",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="unauthorized",
            message=message,
            status_code=401,
            details=details,
        )


class ForbiddenError(APIError):
    """Authenticated but insufficient permissions (403)."""

    def __init__(
        self,
        message: str = "Forbidden",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="forbidden",
            message=message,
            status_code=403,
            details=details,
        )


class ServerError(APIError):
    """Internal server error (500)."""

    def __init__(
        self,
        message: str = "Internal server error",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="server_error",
            message=message,
            status_code=500,
            details=details,
        )


class BadRequestError(APIError):
    """Malformed request (400)."""

    def __init__(
        self,
        message: str = "Bad request",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="bad_request",
            message=message,
            status_code=400,
            details=details,
        )
