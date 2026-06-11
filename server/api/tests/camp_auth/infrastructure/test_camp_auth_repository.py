from __future__ import annotations

from datetime import datetime, timedelta, timezone

from mz_ai_backend.modules.camp_auth.infrastructure.repositories import (
    _to_camp_account,
    _to_naive_utc,
)
from mz_ai_backend.modules.camp_auth.infrastructure.models import CampAccountModel
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus


# ---------------------------------------------------------------------------
# _to_naive_utc
# ---------------------------------------------------------------------------


def test_to_naive_utc_keeps_naive_datetime_unchanged() -> None:
    value = datetime(2026, 5, 18, 7, 30, 0)

    assert _to_naive_utc(value) == value


def test_to_naive_utc_converts_aware_datetime_to_utc_naive() -> None:
    # CST +08:00 → UTC 07:30
    value = datetime(2026, 5, 18, 15, 30, 0, tzinfo=timezone(timedelta(hours=8)))

    converted = _to_naive_utc(value)

    assert converted == datetime(2026, 5, 18, 7, 30, 0)
    assert converted is not None
    assert converted.tzinfo is None


def test_to_naive_utc_allows_none() -> None:
    assert _to_naive_utc(None) is None


# ---------------------------------------------------------------------------
# _to_camp_account mapper
# ---------------------------------------------------------------------------


def _make_camp_account_model(
    *,
    account_id: int = 1001,
    username: str = "testuser",
    email: str | None = None,
    status: str = "active",
    enrollment_status: str = "none",
    enrolled_at: datetime | None = None,
    enrollment_expires_at: datetime | None = None,
    is_deleted: bool = False,
    created_at: datetime | None = None,
    updated_at: datetime | None = None,
) -> CampAccountModel:
    """构造一个 CampAccountModel 用于单元测试，无需数据库连接。

    直接使用 ORM 默认构造器即可在无 Session 的情况下创建 transient 实例。
    server_default 字段（created_at / updated_at）不会自动填充，需要显式传入。
    """
    now = datetime(2026, 6, 1, 12, 0, 0)
    return CampAccountModel(
        account_id=account_id,
        username=username,
        email=email,
        status=status,
        enrollment_status=enrollment_status,
        enrolled_at=enrolled_at,
        enrollment_expires_at=enrollment_expires_at,
        is_deleted=is_deleted,
        created_at=created_at or now,
        updated_at=updated_at or now,
    )


def test_to_camp_account_maps_basic_fields() -> None:
    now = datetime(2026, 6, 1, 12, 0, 0)
    model = _make_camp_account_model(
        account_id=42,
        username="alice",
        email="alice@example.com",
        status="active",
        created_at=now,
        updated_at=now,
    )

    account = _to_camp_account(model)

    assert account.account_id == 42
    assert account.username == "alice"
    assert account.email == "alice@example.com"
    assert account.status == CampAccountStatus.ACTIVE
    assert account.is_deleted is False
    assert account.created_at == now
    assert account.updated_at == now


def test_to_camp_account_maps_enrollment_fields() -> None:
    enrolled = datetime(2026, 1, 1, 0, 0, 0)
    expires = datetime(2026, 12, 31, 23, 59, 59)
    model = _make_camp_account_model(
        enrollment_status="enrolled",
        enrolled_at=enrolled,
        enrollment_expires_at=expires,
    )

    account = _to_camp_account(model)

    assert account.enrollment_status == "enrolled"
    assert account.enrolled_at == enrolled
    assert account.enrollment_expires_at == expires


def test_to_camp_account_enrollment_defaults_to_none_values() -> None:
    """enrollment_status="none" のとき enrolled_at と enrollment_expires_at は None。"""
    model = _make_camp_account_model(
        enrollment_status="none",
        enrolled_at=None,
        enrollment_expires_at=None,
    )

    account = _to_camp_account(model)

    assert account.enrollment_status == "none"
    assert account.enrolled_at is None
    assert account.enrollment_expires_at is None


def test_to_camp_account_has_no_password_fields() -> None:
    """CampAccount 领域实体不含任何 password 字段。"""
    model = _make_camp_account_model()
    account = _to_camp_account(model)

    assert not hasattr(account, "password_hash")
    assert not hasattr(account, "password_salt")
    assert not hasattr(account, "password_scheme_version")


def test_to_camp_account_disabled_status() -> None:
    model = _make_camp_account_model(status="disabled")
    account = _to_camp_account(model)

    assert account.status == CampAccountStatus.DISABLED


def test_to_camp_account_is_deleted_true() -> None:
    model = _make_camp_account_model(is_deleted=True)
    account = _to_camp_account(model)

    assert account.is_deleted is True
