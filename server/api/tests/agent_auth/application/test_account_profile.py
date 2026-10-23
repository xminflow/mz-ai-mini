from __future__ import annotations

import base64
from datetime import UTC, datetime, timedelta

import pytest
from pydantic import ValidationError

from mz_ai_backend.modules.agent_auth.application.dtos import AgentAccountRegistration, AgentAccountSummary
from mz_ai_backend.modules.agent_auth.application.use_cases.update_agent_profile import (
    UpdateAgentDisplayNameCommand, UploadAgentAvatarCommand, UpdateAgentProfileUseCase, UploadAgentAvatarUseCase,
)
from mz_ai_backend.modules.agent_auth.domain import (
    AgentAccount, AgentAccountStatus, AgentAccessTokenRecord, AgentAuthSession, AgentAccessTokenExpiredException,
)


class ProfileRepository:
    def __init__(self) -> None:
        now = datetime.now(UTC).replace(tzinfo=None)
        self.account = AgentAccount(account_id=1, username="wxoa_1", display_name="weelume", email=None,
            password_hash=None, password_salt=None, password_scheme_version=None,
            status=AgentAccountStatus.ACTIVE, is_deleted=False, created_at=now, updated_at=now)
        self.now = now

    async def get_access_token_record(self, token: str) -> AgentAccessTokenRecord | None:
        if token != "valid":
            return None
        return AgentAccessTokenRecord(token_id=1, session_id=1, access_token_hash=token,
            expires_at=self.now + timedelta(hours=1), created_at=self.now)

    async def get_session_by_id(self, session_id: int) -> AgentAuthSession:
        return AgentAuthSession(session_id=session_id, account_id=1, refresh_token_hash="hash",
            expires_at=self.now + timedelta(days=1), revoked_at=None, created_at=self.now, updated_at=self.now)

    async def get_account_by_id(self, account_id: int) -> AgentAccount:
        assert account_id == 1
        return self.account

    async def update_account_profile(self, *, account_id: int, display_name: str | None = None,
                                     avatar_url: str | None = None) -> AgentAccount:
        assert account_id == 1
        updates: dict[str, str] = {}
        if display_name is not None:
            updates["display_name"] = display_name
        if avatar_url is not None:
            updates["avatar_url"] = avatar_url
        self.account = self.account.model_copy(update=updates)
        return self.account


class Tokens:
    def hash_token(self, token: str) -> str:
        return token


class Storage:
    def __init__(self, *, fail: bool = False) -> None:
        self.uploads = 0
        self.fail = fail

    async def upload(self, *, account_id: int, content: bytes, content_type: str) -> str:
        self.uploads += 1
        if self.fail:
            raise RuntimeError("test storage failure")
        assert account_id == 1 and content_type == "image/png" and content.startswith(b"\x89PNG")
        return "https://example.com/avatar.png"


PNG = base64.b64encode(b"\x89PNG\r\n\x1a\nfixture").decode()


def test_registration_defaults_and_legacy_name_compatibility() -> None:
    registration = AgentAccountRegistration(account_id=1, username="wxoa_1", status=AgentAccountStatus.ACTIVE)
    assert registration.display_name == "weelume"
    old = ProfileRepository().account.model_copy(update={"display_name": None, "username": "existing_user"})
    assert AgentAccountSummary.from_account(old).display_name == "existing_user"


@pytest.mark.parametrize("name", ["", "  ", "a\n", "a\x00", "a" * 65])
def test_name_rejects_invalid_values(name: str) -> None:
    # 首尾换行按空白清理，名称内部控制字符应拒绝。
    if name == "a\n":
        name = "a\nb"
    with pytest.raises(ValidationError):
        UpdateAgentDisplayNameCommand(access_token="valid", display_name=name)


@pytest.mark.asyncio
async def test_profile_updates_preserve_internal_id_and_other_fields() -> None:
    repo = ProfileRepository()
    storage = Storage()
    result = await UploadAgentAvatarUseCase(account_repository=repo, token_service=Tokens(), avatar_storage=storage).execute(
        UploadAgentAvatarCommand(access_token="valid", content_type="image/png", content_base64=PNG))
    assert result.account.avatar_url == "https://example.com/avatar.png"
    result = await UpdateAgentProfileUseCase(account_repository=repo, token_service=Tokens()).execute(
        UpdateAgentDisplayNameCommand(access_token="valid", display_name=" 小微 AI "))
    assert result.account.display_name == "小微 AI"
    assert result.account.username == "wxoa_1"
    assert result.account.avatar_url == "https://example.com/avatar.png"


@pytest.mark.asyncio
async def test_avatar_requires_auth_and_storage_failure_does_not_change_profile() -> None:
    repo, storage = ProfileRepository(), Storage()
    with pytest.raises(AgentAccessTokenExpiredException):
        await UploadAgentAvatarUseCase(account_repository=repo, token_service=Tokens(), avatar_storage=storage).execute(
            UploadAgentAvatarCommand(access_token="invalid", content_type="image/png", content_base64=PNG))
    assert storage.uploads == 0
    with pytest.raises(RuntimeError):
        await UploadAgentAvatarUseCase(account_repository=repo, token_service=Tokens(), avatar_storage=Storage(fail=True)).execute(
            UploadAgentAvatarCommand(access_token="valid", content_type="image/png", content_base64=PNG))
    assert repo.account.avatar_url is None


@pytest.mark.parametrize("mime,content", [("image/svg+xml", b"<svg/>"), ("image/png", b"<html>"), ("image/jpeg", b""), ("image/webp", b"RIFFfake"), ("image/png", b"\x89PNG\r\n\x1a\n" + b"x" * (2 * 1024 * 1024))], ids=["svg", "mismatch", "empty", "invalid-webp", "oversized"])
def test_avatar_rejects_unsupported_mismatched_and_large_files(mime: str, content: bytes) -> None:
    with pytest.raises(ValidationError):
        UploadAgentAvatarCommand(access_token="valid", content_type=mime, content_base64=base64.b64encode(content).decode())
