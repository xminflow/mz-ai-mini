from __future__ import annotations

import logging
import platform
from datetime import datetime, timezone
from typing import Annotated

import typer

from ua_agent import __version__
from ua_agent.contracts.ping import (
    BackendIdentity,
    PingError,
    PingErrorDetail,
    PingSuccess,
)

logger = logging.getLogger(__name__)

_MAX_MESSAGE_LENGTH = 256


def _now_rfc3339_utc_ms() -> str:
    return (
        datetime.now(timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )


def _backend_identity() -> BackendIdentity:
    return BackendIdentity(
        version=__version__,
        python=platform.python_version(),
    )


def _emit_error(code: str, message: str, exit_code: int) -> None:
    envelope = PingError(error=PingErrorDetail(code=code, message=message))  # type: ignore[arg-type]
    typer.echo(envelope.model_dump_json())
    raise typer.Exit(code=exit_code)


def ping(
    json: Annotated[
        bool,
        typer.Option("--json", help="Emit a single JSON object on stdout."),
    ] = False,
    message: Annotated[
        str | None,
        typer.Option("--message", help="Optional echoed message (max 256 chars)."),
    ] = None,
) -> None:
    """Emit a contract-valid ping payload."""
    del json  # v1: every output mode is JSON; flag exists for forward compat / docs.
    try:
        if message is not None and len(message) > _MAX_MESSAGE_LENGTH:
            _emit_error(
                code="INVALID_INPUT",
                message=(
                    f"--message exceeds maximum length of {_MAX_MESSAGE_LENGTH} characters"
                ),
                exit_code=64,
            )

        payload = PingSuccess(
            message="pong",
            echo=message,
            timestamp=_now_rfc3339_utc_ms(),
            backend=_backend_identity(),
        )
        typer.echo(payload.model_dump_json())
    except typer.Exit:
        raise
    except Exception as exc:  # noqa: BLE001 — boundary catch-all per contract
        logger.exception("ping command failed")
        _emit_error(code="INTERNAL", message=str(exc) or "internal error", exit_code=70)
