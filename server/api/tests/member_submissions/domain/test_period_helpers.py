from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.member_submissions.domain import (
    compute_period_bounds,
    compute_period_key,
)


def test_compute_period_key_pads_month_to_two_digits() -> None:
    assert compute_period_key(datetime(2026, 5, 21, 12, 0, 0)) == "202605"


def test_compute_period_key_handles_january() -> None:
    assert compute_period_key(datetime(2026, 1, 1, 0, 0, 0)) == "202601"


def test_compute_period_key_handles_december() -> None:
    assert compute_period_key(datetime(2026, 12, 31, 23, 59, 59)) == "202612"


def test_compute_period_bounds_returns_natural_month_range() -> None:
    start, end = compute_period_bounds("202605")
    assert start == datetime(2026, 5, 1)
    assert end == datetime(2026, 6, 1)


def test_compute_period_bounds_handles_december_rollover() -> None:
    start, end = compute_period_bounds("202612")
    assert start == datetime(2026, 12, 1)
    assert end == datetime(2027, 1, 1)


def test_compute_period_bounds_rejects_invalid_key_length() -> None:
    with pytest.raises(ValueError):
        compute_period_bounds("20265")


def test_compute_period_bounds_rejects_non_digit_key() -> None:
    with pytest.raises(ValueError):
        compute_period_bounds("2026Q2")


def test_compute_period_bounds_rejects_out_of_range_month() -> None:
    with pytest.raises(ValueError):
        compute_period_bounds("202613")


def test_period_key_crosses_month_boundary() -> None:
    last_minute = datetime(2026, 5, 31, 23, 59, 59)
    first_minute = datetime(2026, 6, 1, 0, 0, 0)
    assert compute_period_key(last_minute) == "202605"
    assert compute_period_key(first_minute) == "202606"
