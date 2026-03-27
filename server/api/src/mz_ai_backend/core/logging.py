from __future__ import annotations

import json
import logging
import sys
from datetime import UTC, datetime
from typing import Any

from .config import Settings
from .request_context import maybe_get_request_context


class RequestContextFilter(logging.Filter):
    """Attach request-scoped metadata to log records."""

    _default_fields = (
        "request_id",
        "method",
        "path",
        "client_ip",
        "status_code",
        "duration_ms",
        "error_code",
        "exception_type",
        "details",
    )

    def filter(self, record: logging.LogRecord) -> bool:
        context = maybe_get_request_context()
        if context is not None:
            record.request_id = getattr(record, "request_id", context.request_id)
            record.method = getattr(record, "method", context.method)
            record.path = getattr(record, "path", context.path)
            record.client_ip = getattr(record, "client_ip", context.client_ip)
        for field_name in self._default_fields:
            if not hasattr(record, field_name):
                setattr(record, field_name, None)
        return True


class JsonFormatter(logging.Formatter):
    """Render log records as JSON."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", None),
            "method": getattr(record, "method", None),
            "path": getattr(record, "path", None),
            "client_ip": getattr(record, "client_ip", None),
            "status_code": getattr(record, "status_code", None),
            "duration_ms": getattr(record, "duration_ms", None),
            "error_code": getattr(record, "error_code", None),
            "exception_type": getattr(record, "exception_type", None),
            "details": getattr(record, "details", None),
        }
        if record.exc_info:
            payload["stack_trace"] = self.formatException(record.exc_info)
        return json.dumps(
            {key: value for key, value in payload.items() if value is not None},
            ensure_ascii=False,
        )


def configure_logging(settings: Settings) -> None:
    """Configure application logging."""

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    handler.addFilter(RequestContextFilter())
    handler._mz_ai_backend_handler = True  # type: ignore[attr-defined]

    root_logger = logging.getLogger()
    existing_handlers = [
        existing_handler
        for existing_handler in root_logger.handlers
        if not getattr(existing_handler, "_mz_ai_backend_handler", False)
    ]
    root_logger.handlers = [*existing_handlers, handler]
    root_logger.setLevel(getattr(logging, settings.log_level))

    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(logger_name)
        logger.handlers.clear()
        logger.propagate = True


def get_logger(name: str) -> logging.Logger:
    """Return a configured application logger."""

    return logging.getLogger(name)


__all__ = ["configure_logging", "get_logger"]
