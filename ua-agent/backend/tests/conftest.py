from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Iterable

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]


def _run_cli(args: Iterable[str]) -> tuple[str, str, int]:
    """Run `python -m ua_agent <args>` against the current interpreter."""
    proc = subprocess.run(
        [sys.executable, "-m", "ua_agent", *args],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return proc.stdout, proc.stderr, proc.returncode


@pytest.fixture
def run_cli():
    return _run_cli
