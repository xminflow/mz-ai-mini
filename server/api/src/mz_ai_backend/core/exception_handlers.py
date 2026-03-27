from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .error_codes import ErrorCode
from .exceptions import AppException, BusinessException, SystemException
from .logging import get_logger
from .protocol import error_response
from .request_context import maybe_get_request_context


error_logger = get_logger("mz_ai_backend.errors")


def _validation_message(errors: Iterable[dict[str, Any]]) -> str:
    first_error = next(iter(errors), None)
    if first_error is None:
        return "Request validation failed."

    location = ".".join(str(part) for part in first_error["loc"] if part != "body")
    if not location:
        location = "request"
    return f"Validation failed for {location}: {first_error['msg']}."


def _response_headers(request_id: str) -> dict[str, str]:
    return {"X-Request-Id": request_id}


def _resolve_request_id(request: Request) -> str:
    context = maybe_get_request_context()
    if context is not None:
        return context.request_id

    request_id = getattr(request.state, "request_id", None)
    if request_id is None:
        raise RuntimeError("Request id is not available.")
    return str(request_id)


def _log_app_exception(exc: AppException, *, request_id: str) -> None:
    extra = {
        "request_id": request_id,
        "error_code": exc.error_code,
        "exception_type": exc.__class__.__name__,
        "details": exc.details,
        "status_code": exc.http_status,
    }
    if isinstance(exc, SystemException):
        error_logger.error("application.exception", extra=extra)
        return
    if isinstance(exc, BusinessException):
        error_logger.warning("application.exception", extra=extra)
        return
    error_logger.error("application.exception", extra=extra)


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers for the application."""

    @app.exception_handler(AppException)
    async def handle_app_exception(
        request: Request,
        exc: AppException,
    ) -> JSONResponse:
        request_id = _resolve_request_id(request)
        _log_app_exception(exc, request_id=request_id)
        response = error_response(
            error_code=exc.error_code,
            message=exc.message,
            request_id=request_id,
        )
        return JSONResponse(
            status_code=exc.http_status,
            content=response.model_dump(mode="json"),
            headers=_response_headers(request_id),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_request_validation_error(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        request_id = _resolve_request_id(request)
        message = _validation_message(exc.errors())
        error_logger.warning(
            "request.validation_failed",
            extra={
                "request_id": request_id,
                "error_code": ErrorCode.COMMON_VALIDATION_ERROR.value,
                "exception_type": exc.__class__.__name__,
                "details": {"errors": exc.errors()},
                "status_code": 422,
            },
        )
        response = error_response(
            error_code=ErrorCode.COMMON_VALIDATION_ERROR,
            message=message,
            request_id=request_id,
        )
        return JSONResponse(
            status_code=422,
            content=response.model_dump(mode="json"),
            headers=_response_headers(request_id),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_exception(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        request_id = _resolve_request_id(request)
        error_logger.exception(
            "application.unexpected_exception",
            exc_info=exc,
            extra={
                "request_id": request_id,
                "error_code": ErrorCode.SYSTEM_UNEXPECTED_ERROR.value,
                "exception_type": exc.__class__.__name__,
                "status_code": 500,
            },
        )
        response = error_response(
            error_code=ErrorCode.SYSTEM_UNEXPECTED_ERROR,
            message="Unexpected internal error.",
            request_id=request_id,
        )
        return JSONResponse(
            status_code=500,
            content=response.model_dump(mode="json"),
            headers=_response_headers(request_id),
        )


__all__ = ["register_exception_handlers"]
