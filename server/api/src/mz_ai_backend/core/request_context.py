from __future__ import annotations

from contextvars import ContextVar, Token

from pydantic import BaseModel, ConfigDict


class RequestContext(BaseModel):
    """Request-scoped metadata propagated through the call chain."""

    model_config = ConfigDict(frozen=True)

    request_id: str
    method: str
    path: str
    client_ip: str | None = None


_request_context: ContextVar[RequestContext | None] = ContextVar(
    "mz_ai_backend_request_context",
    default=None,
)


def set_request_context(context: RequestContext) -> Token[RequestContext | None]:
    """Bind the current request context and return the reset token."""

    return _request_context.set(context)


def get_request_context() -> RequestContext:
    """Return the active request context or raise when it is missing."""

    context = _request_context.get()
    if context is None:
        raise RuntimeError("Request context is not available.")
    return context


def maybe_get_request_context() -> RequestContext | None:
    """Return the active request context when one exists."""

    return _request_context.get()


def get_request_id() -> str:
    """Return the active request id."""

    return get_request_context().request_id


def reset_request_context(token: Token[RequestContext | None]) -> None:
    """Reset the current request context to the previous state."""

    _request_context.reset(token)


__all__ = [
    "RequestContext",
    "get_request_context",
    "get_request_id",
    "maybe_get_request_context",
    "reset_request_context",
    "set_request_context",
]
