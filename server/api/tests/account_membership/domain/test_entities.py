from __future__ import annotations

from datetime import datetime

from mz_ai_backend.modules.account_membership.domain import calculate_membership_period


def test_calculate_membership_period_starts_from_paid_at_for_new_member() -> None:
    paid_at = datetime(2026, 5, 18, 10, 0, 0)

    started_at, expires_at = calculate_membership_period(
        current_started_at=None,
        current_expires_at=None,
        paid_at=paid_at,
        now=paid_at,
    )

    assert started_at == paid_at
    assert (expires_at - started_at).days == 365


def test_calculate_membership_period_extends_active_member_from_current_expiry() -> None:
    paid_at = datetime(2026, 5, 18, 10, 0, 0)
    original_started_at = datetime(2026, 1, 1, 0, 0, 0)
    original_expires_at = datetime(2027, 1, 1, 0, 0, 0)

    started_at, expires_at = calculate_membership_period(
        current_started_at=original_started_at,
        current_expires_at=original_expires_at,
        paid_at=paid_at,
        now=paid_at,
    )

    assert started_at == original_started_at
    assert (expires_at - original_expires_at).days == 365
