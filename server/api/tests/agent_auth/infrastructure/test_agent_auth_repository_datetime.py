from __future__ import annotations

from datetime import datetime, timedelta, timezone

from mz_ai_backend.modules.agent_auth.infrastructure.repositories import _to_naive_utc


def test_to_naive_utc_keeps_naive_datetime_unchanged() -> None:
    value = datetime(2026, 5, 18, 7, 30, 0)

    assert _to_naive_utc(value) == value


def test_to_naive_utc_converts_aware_datetime_to_utc_naive() -> None:
    value = datetime(2026, 5, 18, 15, 30, 0, tzinfo=timezone(timedelta(hours=8)))

    converted = _to_naive_utc(value)

    assert converted == datetime(2026, 5, 18, 7, 30, 0)
    assert converted is not None
    assert converted.tzinfo is None


def test_to_naive_utc_allows_none() -> None:
    assert _to_naive_utc(None) is None
