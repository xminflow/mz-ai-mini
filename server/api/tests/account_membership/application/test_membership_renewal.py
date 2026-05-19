from __future__ import annotations

from datetime import datetime

from mz_ai_backend.modules.account_membership.domain import calculate_membership_period


def test_renewal_extends_active_membership_from_existing_expiry() -> None:
    paid_at = datetime(2026, 5, 18, 10, 0, 0)
    existing_started_at = datetime(2026, 1, 1, 0, 0, 0)
    existing_expires_at = datetime(2026, 6, 17, 0, 0, 0)

    started_at, expires_at = calculate_membership_period(
        current_started_at=existing_started_at,
        current_expires_at=existing_expires_at,
        paid_at=paid_at,
        now=paid_at,
    )

    assert started_at == existing_started_at
    assert expires_at == datetime(2027, 6, 17, 0, 0, 0)


def test_renewal_restarts_expired_membership_from_paid_at() -> None:
    paid_at = datetime(2026, 5, 18, 10, 0, 0)
    existing_started_at = datetime(2025, 1, 1, 0, 0, 0)
    existing_expires_at = datetime(2026, 1, 1, 0, 0, 0)

    started_at, expires_at = calculate_membership_period(
        current_started_at=existing_started_at,
        current_expires_at=existing_expires_at,
        paid_at=paid_at,
        now=paid_at,
    )

    assert started_at == paid_at
    assert expires_at == datetime(2027, 5, 18, 10, 0, 0)
