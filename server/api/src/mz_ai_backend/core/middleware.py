from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError

from .exceptions import AppException
from .logging import get_logger
from .request_context import RequestContext, reset_request_context, set_request_context


access_logger = get_logger("mz_ai_backend.http")


def register_middlewares(app: FastAPI) -> None:
    """Register HTTP middlewares."""

    @app.middleware("http")
    async def request_context_middleware(request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-Id") or str(uuid4())
        request.state.request_id = request_id
        context = RequestContext(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client_ip=request.client.host if request.client is not None else None,
        )
        token = set_request_context(context)
        started_at = datetime.now(UTC)
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers["X-Request-Id"] = request_id
            return response
        except AppException as exc:
            status_code = exc.http_status
            raise
        except RequestValidationError:
            status_code = 422
            raise
        except Exception:
            status_code = 500
            raise
        finally:
            duration_ms = round((datetime.now(UTC) - started_at).total_seconds() * 1000, 3)
            access_logger.info(
                "request.completed",
                extra={
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                },
            )
            reset_request_context(token)


__all__ = ["register_middlewares"]
