from __future__ import annotations

import os
import sys
import time
from pathlib import Path
from typing import Annotated

import typer

from ua_agent.contracts.error import ErrorDetail, ErrorEnvelope
from ua_agent.contracts.jimeng import JimengSuccess
from ua_agent.commands._jimeng_volc import (
    JimengOptions,
    JimengReferenceOptions,
    generate_image,
    generate_image_with_reference,
)

jimeng_app = typer.Typer(no_args_is_help=True, help="VolcEngine Jimeng t2i tools.")


@jimeng_app.command("generate-image")
def generate_image_cmd(
    prompt: Annotated[str, typer.Option(..., "--prompt", help="Text prompt for t2i")],
    output: Annotated[Path, typer.Option(..., "--output", help="Absolute path to write PNG")],
    width: Annotated[int, typer.Option("--width", help="Image width in pixels")] = 1024,
    height: Annotated[int, typer.Option("--height", help="Image height in pixels")] = 1280,
) -> None:
    """Generate a single t2i image and write to --output. Emits a JSON envelope on stdout."""
    started = time.monotonic()
    access = os.environ.get("JIMENG_ACCESS_KEY", "").strip()
    secret = os.environ.get("JIMENG_SECRET_KEY", "").strip()
    if not access or not secret:
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="JIMENG_NOT_CONFIGURED",
                message="JIMENG_ACCESS_KEY / JIMENG_SECRET_KEY must be set in env.",
            )
        )
        sys.stdout.write(envelope.model_dump_json() + "\n")
        raise typer.Exit(code=1)
    try:
        out_path = generate_image(
            access,
            secret,
            JimengOptions(
                prompt=prompt,
                output_path=output.expanduser().resolve(),
                width=width,
                height=height,
            ),
        )
        elapsed_ms = int((time.monotonic() - started) * 1000)
        success = JimengSuccess(
            image_path=str(out_path),
            width=width,
            height=height,
            elapsed_ms=elapsed_ms,
        )
        sys.stdout.write(success.model_dump_json() + "\n")
    except Exception as exc:  # noqa: BLE001 — Typer wraps and we want to surface code+msg
        message = str(exc)
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="JIMENG_API_FAILED",
                message=message[:1024] if message else "Unknown Jimeng API failure.",
            )
        )
        sys.stdout.write(envelope.model_dump_json() + "\n")
        raise typer.Exit(code=1) from exc


@jimeng_app.command("generate-reference-image")
def generate_reference_image_cmd(
    prompt: Annotated[str, typer.Option(..., "--prompt", help="Text prompt for image generation")],
    reference: Annotated[Path, typer.Option(..., "--reference", help="Absolute path to reference image")],
    output: Annotated[Path, typer.Option(..., "--output", help="Absolute path to write PNG")],
    width: Annotated[int, typer.Option("--width", help="Image width in pixels")] = 1024,
    height: Annotated[int, typer.Option("--height", help="Image height in pixels")] = 1280,
) -> None:
    """Generate a single reference-image cover and write to --output."""
    started = time.monotonic()
    access = os.environ.get("JIMENG_ACCESS_KEY", "").strip()
    secret = os.environ.get("JIMENG_SECRET_KEY", "").strip()
    if not access or not secret:
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="JIMENG_NOT_CONFIGURED",
                message="JIMENG_ACCESS_KEY / JIMENG_SECRET_KEY must be set in env.",
            )
        )
        sys.stdout.write(envelope.model_dump_json() + "\n")
        raise typer.Exit(code=1)
    try:
        out_path = generate_image_with_reference(
            access,
            secret,
            JimengReferenceOptions(
                prompt=prompt,
                reference_path=reference.expanduser().resolve(),
                output_path=output.expanduser().resolve(),
                width=width,
                height=height,
            ),
        )
        elapsed_ms = int((time.monotonic() - started) * 1000)
        success = JimengSuccess(
            image_path=str(out_path),
            width=width,
            height=height,
            elapsed_ms=elapsed_ms,
        )
        sys.stdout.write(success.model_dump_json() + "\n")
    except Exception as exc:  # noqa: BLE001
        message = str(exc)
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="JIMENG_API_FAILED",
                message=message[:1024] if message else "Unknown Jimeng API failure.",
            )
        )
        sys.stdout.write(envelope.model_dump_json() + "\n")
        raise typer.Exit(code=1) from exc
