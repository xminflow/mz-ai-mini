from __future__ import annotations

import sys

import typer

from ua_agent.commands.jimeng import jimeng_app
from ua_agent.commands.library import library_app
from ua_agent.commands.ping import ping
from ua_agent.commands.transcript import transcript_app

# On Windows, sys.stdout/stderr default to the OEM codepage (e.g. cp936 on
# Chinese installs). Pydantic's model_dump_json() emits real UTF-8 bytes for
# CJK strings, but typer.echo → print → cp936 encoder mangles them, and the
# Node side (which reads stdout as UTF-8) sees mojibake. Force UTF-8 here so
# every JSON-line subcommand round-trips Chinese transcripts correctly.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
        except Exception:  # noqa: BLE001
            pass

app = typer.Typer(no_args_is_help=True, add_completion=False)


@app.callback()
def _root() -> None:  # pyright: ignore[reportUnusedFunction]
    """ua-agent CLI."""


app.command("ping")(ping)
app.add_typer(library_app, name="library")
app.add_typer(jimeng_app, name="jimeng")
app.add_typer(transcript_app, name="transcript")
