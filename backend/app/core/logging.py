"""Structured JSON logging for production observability.

Provides a logger factory that outputs structured JSON logs with:
- Timestamp (ISO 8601)
- Log level
- Logger name
- Message
- Request ID (from request context)
- Extra contextual data
"""

import json
import logging
import sys
from contextvars import ContextVar
from datetime import datetime
from typing import Any, Dict, Optional

# Context variable for storing request ID across async contexts
request_id_context: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


class JSONFormatter(logging.Formatter):
    """Custom formatter that outputs logs as JSON."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON string.

        Args:
            record: Log record to format

        Returns:
            JSON string with structured log data
        """
        # Build base log entry
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add request ID from context if available
        request_id = request_id_context.get()
        if request_id:
            log_data["request_id"] = request_id

        # Add extra data from record
        if hasattr(record, "extra_data") and record.extra_data:
            log_data["extra"] = record.extra_data

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add module and function info for debugging
        if record.pathname:
            log_data["module"] = record.module
            log_data["function"] = record.funcName
            log_data["line"] = record.lineno

        return json.dumps(log_data)


def get_logger(name: str, level: Optional[str] = None) -> logging.Logger:
    """Get or create a structured JSON logger.

    Args:
        name: Logger name (typically __name__ from calling module)
        level: Optional log level override (DEBUG, INFO, WARNING, ERROR)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Only configure if not already configured (avoid duplicate handlers)
    if not logger.handlers:
        # Set log level from environment or default to INFO
        log_level = level or "INFO"
        logger.setLevel(getattr(logging, log_level.upper()))

        # Create console handler with JSON formatter
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)

        # Prevent propagation to root logger (avoid duplicate logs)
        logger.propagate = False

    return logger


def set_request_id(request_id: str) -> None:
    """Set request ID in current async context.

    Args:
        request_id: Unique request identifier
    """
    request_id_context.set(request_id)


def clear_request_id() -> None:
    """Clear request ID from current async context."""
    request_id_context.set(None)


def log_with_extra(logger: logging.Logger, level: str, message: str, **kwargs) -> None:
    """Log message with extra contextual data.

    Args:
        logger: Logger instance
        level: Log level (debug, info, warning, error)
        message: Log message
        **kwargs: Extra data to include in log entry
    """
    log_func = getattr(logger, level.lower())
    # Create a log record with extra data
    log_func(message, extra={"extra_data": kwargs})
