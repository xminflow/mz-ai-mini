from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from mz_ai_backend.core.exceptions import NotFoundException, ValidationException
from mz_ai_backend.modules.camp_auth.application.admin_dtos import (
    CampAccountAdminFilter,
    CampAccountAdminView,
    DeleteCampAccountCommand,
    GetCampAccountQuery,
    ListCampAccountsQuery,
    UpdateCampAccountMembershipCommand,
    UpdateCampAccountStatusCommand,
)
from mz_ai_backend.modules.camp_auth.application.use_cases import (
    DeleteCampAccountUseCase,
    GetCampAccountUseCase,
    ListCampAccountsUseCase,
    UpdateCampAccountMembershipUseCase,
    UpdateCampAccountStatusUseCase,
)
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _view(account_id: int, **overrides) -> CampAccountAdminView:
    base = dict(
        account_id=account_id,
        username=f"camp_{account_id}",
        email=None,
        status=CampAccountStatus.ACTIVE,
        membership_tier="none",
        membership_started_at=None,
        membership_expires_at=None,
        is_deleted=False,
        created_at=_now(),
        updated_at=_now(),
    )
    base.update(overrides)
    return CampAccountAdminView(**base)


class FakeAdminRepository:
    def __init__(self, accounts: list[CampAccountAdminView]) -> None:
        self._accounts = {a.account_id: a for a in accounts}

    async def list_admin_accounts(self, *, filter_, offset, limit):
        rows = [a for a in self._accounts.values() if filter_.include_deleted or not a.is_deleted]
        if filter_.status is not None:
            rows = [a for a in rows if a.status == filter_.status]
        return rows[offset : offset + limit]

    async def count_admin_accounts(self, *, filter_):
        rows = [a for a in self._accounts.values() if filter_.include_deleted or not a.is_deleted]
        if filter_.status is not None:
            rows = [a for a in rows if a.status == filter_.status]
        return len(rows)

    async def get_admin_account_by_id(self, account_id):
        return self._accounts.get(account_id)

    async def update_account_status(self, *, account_id, status):
        acc = self._accounts.get(account_id)
        if acc is None or acc.is_deleted:
            return None
        updated = acc.model_copy(update={"status": status})
        self._accounts[account_id] = updated
        return updated

    async def update_account_membership(self, *, account_id, tier, started_at, expires_at):
        acc = self._accounts.get(account_id)
        if acc is None or acc.is_deleted:
            return None
        updated = acc.model_copy(
            update={
                "membership_tier": tier,
                "membership_started_at": started_at,
                "membership_expires_at": expires_at,
            }
        )
        self._accounts[account_id] = updated
        return updated

    async def soft_delete_account(self, *, account_id):
        acc = self._accounts.get(account_id)
        if acc is None or acc.is_deleted:
            return False
        self._accounts[account_id] = acc.model_copy(update={"is_deleted": True})
        return True


@pytest.mark.asyncio
async def test_list_returns_page_with_total() -> None:
    repo = FakeAdminRepository([_view(1), _view(2), _view(3, is_deleted=True)])
    use_case = ListCampAccountsUseCase(repository=repo)
    page = await use_case.execute(ListCampAccountsQuery(page=1, page_size=20))
    assert page.total == 2
    assert len(page.items) == 2
    assert page.page == 1


@pytest.mark.asyncio
async def test_get_missing_raises_not_found() -> None:
    use_case = GetCampAccountUseCase(repository=FakeAdminRepository([]))
    with pytest.raises(NotFoundException):
        await use_case.execute(GetCampAccountQuery(account_id=999))


@pytest.mark.asyncio
async def test_get_deleted_account_raises_not_found() -> None:
    repo = FakeAdminRepository([_view(1, is_deleted=True)])
    use_case = GetCampAccountUseCase(repository=repo)
    with pytest.raises(NotFoundException):
        await use_case.execute(GetCampAccountQuery(account_id=1))


@pytest.mark.asyncio
async def test_update_status_toggles_disabled() -> None:
    repo = FakeAdminRepository([_view(1)])
    use_case = UpdateCampAccountStatusUseCase(repository=repo)
    updated = await use_case.execute(
        UpdateCampAccountStatusCommand(account_id=1, status=CampAccountStatus.DISABLED)
    )
    assert updated.status == CampAccountStatus.DISABLED


@pytest.mark.asyncio
async def test_update_membership_premium_sets_fields() -> None:
    repo = FakeAdminRepository([_view(1)])
    use_case = UpdateCampAccountMembershipUseCase(repository=repo)
    expires = _now() + timedelta(days=30)
    updated = await use_case.execute(
        UpdateCampAccountMembershipCommand(account_id=1, tier="premium", expires_at=expires)
    )
    assert updated.membership_tier == "premium"
    assert updated.membership_expires_at == expires
    assert updated.membership_started_at is not None


@pytest.mark.asyncio
async def test_update_membership_none_clears_dates() -> None:
    repo = FakeAdminRepository(
        [_view(1, membership_tier="premium", membership_started_at=_now(), membership_expires_at=_now())]
    )
    use_case = UpdateCampAccountMembershipUseCase(repository=repo)
    updated = await use_case.execute(
        UpdateCampAccountMembershipCommand(account_id=1, tier="none", expires_at=None)
    )
    assert updated.membership_tier == "none"
    assert updated.membership_started_at is None
    assert updated.membership_expires_at is None


@pytest.mark.asyncio
async def test_update_membership_preserves_existing_started_at() -> None:
    original_started = datetime(2026, 1, 1)
    repo = FakeAdminRepository([_view(1, membership_started_at=original_started)])
    use_case = UpdateCampAccountMembershipUseCase(repository=repo)
    updated = await use_case.execute(
        UpdateCampAccountMembershipCommand(account_id=1, tier="basic", expires_at=_now() + timedelta(days=30))
    )
    assert updated.membership_started_at == original_started


@pytest.mark.asyncio
async def test_update_membership_rejects_invalid_tier() -> None:
    use_case = UpdateCampAccountMembershipUseCase(repository=FakeAdminRepository([_view(1)]))
    with pytest.raises(ValidationException):
        await use_case.execute(
            UpdateCampAccountMembershipCommand(account_id=1, tier="gold", expires_at=_now())
        )


@pytest.mark.asyncio
async def test_update_membership_non_none_requires_expiry() -> None:
    use_case = UpdateCampAccountMembershipUseCase(repository=FakeAdminRepository([_view(1)]))
    with pytest.raises(ValidationException):
        await use_case.execute(
            UpdateCampAccountMembershipCommand(account_id=1, tier="basic", expires_at=None)
        )


@pytest.mark.asyncio
async def test_delete_missing_raises_not_found() -> None:
    use_case = DeleteCampAccountUseCase(repository=FakeAdminRepository([]))
    with pytest.raises(NotFoundException):
        await use_case.execute(DeleteCampAccountCommand(account_id=1))
