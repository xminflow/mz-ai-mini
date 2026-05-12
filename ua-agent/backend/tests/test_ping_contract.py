from __future__ import annotations

from typing import Callable

import pytest
from pydantic import TypeAdapter

from ua_agent.contracts.ping import PingError, PingResult, PingSuccess

RunCli = Callable[[list[str]], tuple[str, str, int]]

_PingResultAdapter: TypeAdapter[PingSuccess | PingError] = TypeAdapter(PingResult)


def test_ping_success(run_cli: RunCli) -> None:
    stdout, stderr, exit_code = run_cli(["ping", "--json"])

    assert exit_code == 0, f"non-zero exit: stderr={stderr!r}"
    assert stderr == ""

    result = _PingResultAdapter.validate_json(stdout.strip())
    assert isinstance(result, PingSuccess)
    assert result.ok is True
    assert result.schema_version == "1"
    assert result.message == "pong"
    assert result.backend.name == "ua-agent"


def test_ping_invalid_input(run_cli: RunCli) -> None:
    long_message = "a" * 300
    stdout, _stderr, exit_code = run_cli(["ping", "--json", "--message", long_message])

    assert exit_code == 64

    result = _PingResultAdapter.validate_json(stdout.strip())
    assert isinstance(result, PingError)
    assert result.ok is False
    assert result.schema_version == "1"
    assert result.error.code == "INVALID_INPUT"


@pytest.mark.parametrize(
    "args,expected_ok",
    [
        (["ping", "--json"], True),
        (["ping", "--json", "--message", "a" * 300], False),
    ],
)
def test_schema_version_is_v1(
    run_cli: RunCli, args: list[str], expected_ok: bool
) -> None:
    stdout, _stderr, _exit_code = run_cli(args)
    result = _PingResultAdapter.validate_json(stdout.strip())
    assert result.schema_version == "1"
    assert result.ok is expected_ok
