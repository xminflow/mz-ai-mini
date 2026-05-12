from __future__ import annotations

import logging
from typing import Annotated, Any

import typer

from ua_agent.contracts.error import ErrorCode, ErrorDetail, ErrorEnvelope
from ua_agent.contracts.library import (
    LibraryDeleteSuccess,
    LibraryListFilters,
    LibraryListSuccess,
)
from ua_agent.library.store import (
    delete_material_entry,
    list_material_entries,
    open_store,
)

logger = logging.getLogger(__name__)

library_app = typer.Typer(no_args_is_help=True, add_completion=False)


def _emit_error(code: ErrorCode, message: str) -> None:
    envelope = ErrorEnvelope(error=ErrorDetail(code=code, message=(message or code)[:1024]))
    typer.echo(envelope.model_dump_json())


def run_list(
    *,
    from_: str | None,
    to: str | None,
    author: str | None,
    limit: int,
    offset: int,
    open_store_fn: Any = open_store,
) -> None:
    try:
        if from_ is not None and to is not None and from_ > to:
            _emit_error("INVALID_INPUT", "--from must be ≤ --to")
            return
        filters = LibraryListFilters(
            from_=from_,
            to=to,
            author=author,
            limit=limit,
            offset=offset,
        )
        with open_store_fn() as conn:
            entries, total, library_total = list_material_entries(conn, filters)
        payload = LibraryListSuccess(
            entries=entries,
            total=total,
            library_total=library_total,
            applied_filters=filters,
        )
        typer.echo(payload.model_dump_json(by_alias=True))
    except Exception as exc:  # noqa: BLE001
        logger.exception("library list failed")
        _emit_error("INTERNAL", str(exc) or "internal error")


def run_delete(
    *,
    post_id: str,
    open_store_fn: Any = open_store,
) -> None:
    try:
        with open_store_fn() as conn:
            removed = delete_material_entry(conn, post_id)
        if not removed:
            _emit_error("LIBRARY_NOT_FOUND", f"post_id {post_id} does not exist")
            return
        payload = LibraryDeleteSuccess(deleted_post_id=post_id)
        typer.echo(payload.model_dump_json())
    except Exception as exc:  # noqa: BLE001
        logger.exception("library delete failed")
        _emit_error("INTERNAL", str(exc) or "internal error")


@library_app.command("list")
def list_cmd(
    json: Annotated[
        bool,
        typer.Option("--json", help="Emit a single JSON object on stdout."),
    ] = False,
    from_: Annotated[
        str | None,
        typer.Option("--from", help="Inclusive lower bound on captured_at (RFC 3339 UTC)."),
    ] = None,
    to: Annotated[
        str | None,
        typer.Option("--to", help="Inclusive upper bound on captured_at (RFC 3339 UTC)."),
    ] = None,
    author: Annotated[
        str | None,
        typer.Option("--author", help="Exact match on author_handle."),
    ] = None,
    limit: Annotated[
        int,
        typer.Option("--limit", help="Page size (1..200, default 50)."),
    ] = 50,
    offset: Annotated[
        int,
        typer.Option("--offset", help="Page offset (default 0)."),
    ] = 0,
) -> None:
    """List material entries with optional filters."""
    del json
    run_list(from_=from_, to=to, author=author, limit=limit, offset=offset)


@library_app.command("delete")
def delete_cmd(
    json: Annotated[
        bool,
        typer.Option("--json", help="Emit a single JSON object on stdout."),
    ] = False,
    post_id: Annotated[
        str,
        typer.Option("--post-id", help="post_id of the entry to delete."),
    ] = "",
) -> None:
    """Delete a material entry by post_id."""
    del json
    if not post_id:
        _emit_error("INVALID_INPUT", "--post-id is required")
        return
    run_delete(post_id=post_id)
