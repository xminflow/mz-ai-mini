from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.camp_auth.application.dtos import DevCampFakeLoginCommand
from mz_ai_backend.modules.camp_auth.application.use_cases.dev_camp_fake_login import (
    DevCampFakeLoginUseCase,
)
from mz_ai_backend.modules.camp_auth.application import CampAccountRegistration
from mz_ai_backend.modules.camp_auth.domain import CampAccount, CampAccountStatus


def _account(account_id: int, username: str) -> CampAccount:
    now = datetime.now(UTC).replace(tzinfo=None)
    return CampAccount(
        account_id=account_id, username=username, email=None, status=CampAccountStatus.ACTIVE,
        enrollment_status="none", enrolled_at=None, enrollment_expires_at=None,
        is_deleted=False, created_at=now, updated_at=now,
    )


class _Snowflake:
    def __init__(self) -> None:
        self._v = 8000

    def generate(self) -> int:
        self._v += 1
        return self._v


class _TokenService:
    def generate_token(self) -> str:
        return "tok"

    def hash_token(self, token: str) -> str:
        return f"h:{token}"


class _Repo:
    def __init__(self, existing: CampAccount | None = None) -> None:
        self._existing = existing
        self.created: CampAccountRegistration | None = None
        self.set_membership_calls: list[dict] = []
        self.sessions: list = []

    async def get_account_by_username(self, username: str):
        return self._existing

    async def create_account(self, registration: CampAccountRegistration):
        self.created = registration
        return _account(registration.account_id, registration.username)

    async def set_membership(self, *, account_id, tier, started_at, expires_at) -> None:
        self.set_membership_calls.append({"account_id": account_id, "tier": tier})

    async def create_session(self, issue) -> None:
        self.sessions.append(issue)


def _use_case(repo: _Repo) -> DevCampFakeLoginUseCase:
    return DevCampFakeLoginUseCase(
        account_repository=repo, token_service=_TokenService(), snowflake_id_generator=_Snowflake(),
        access_token_ttl_seconds=900, refresh_token_ttl_days=30,
    )


@pytest.mark.asyncio
async def test_creates_account_and_issues_tokens_without_tier():
    repo = _Repo(existing=None)
    result = await _use_case(repo).execute(DevCampFakeLoginCommand(username="dev_a", tier="none"))
    assert repo.created is not None and repo.created.username == "dev_a"
    assert repo.set_membership_calls == []           # tier=none 不写会员
    assert result.tokens.access_token == "tok"
    assert len(repo.sessions) == 1


@pytest.mark.asyncio
async def test_sets_membership_when_tier_given_and_reuses_existing_account():
    existing = _account(9100, "dev_b")
    repo = _Repo(existing=existing)
    await _use_case(repo).execute(DevCampFakeLoginCommand(username="dev_b", tier="premium"))
    assert repo.created is None                       # 复用已存在账号
    assert repo.set_membership_calls == [{"account_id": 9100, "tier": "premium"}]
