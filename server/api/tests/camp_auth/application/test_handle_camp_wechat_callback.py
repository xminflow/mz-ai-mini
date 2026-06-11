from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.agent_auth.application.ports.services import OfficialWechatInboundMessage
from mz_ai_backend.modules.camp_auth.application.use_cases.handle_wechat_callback import (
    HandleCampWechatCallbackUseCase,
)
from mz_ai_backend.modules.camp_auth.domain import (
    CampAccount,
    CampAccountStatus,
    CampWechatLoginSessionStatus,
    CampWechatSubscribeStatus,
)
from mz_ai_backend.modules.camp_auth.domain.entities import CampWechatLoginSession


class _StubSnowflake:
    def __init__(self) -> None:
        self._value = 5000

    def generate(self) -> int:
        self._value += 1
        return self._value


def _fake_account(account_id: int) -> CampAccount:
    now = datetime.now(UTC).replace(tzinfo=None)
    return CampAccount(
        account_id=account_id,
        username=f"camp_{account_id}",
        email=None,
        status=CampAccountStatus.ACTIVE,
        enrollment_status="none",
        enrolled_at=None,
        enrollment_expires_at=None,
        is_deleted=False,
        created_at=now,
        updated_at=now,
    )


def _fake_pending_session(scene_key: str) -> CampWechatLoginSession:
    now = datetime.now(UTC).replace(tzinfo=None)
    return CampWechatLoginSession(
        login_session_id=9999,
        scene_key=scene_key,
        status=CampWechatLoginSessionStatus.PENDING,
        official_openid=None,
        account_id=None,
        login_grant_token_hash=None,
        expires_at=now,
        authenticated_at=None,
        consumed_at=None,
        created_at=now,
        updated_at=now,
    )


class _FakeCampRepo:
    """可配置的伪 camp 账号仓库，记录所有写操作调用。"""

    def __init__(
        self,
        *,
        existing_identity=None,
        existing_session=None,
    ) -> None:
        self._existing_identity = existing_identity
        self._existing_session = existing_session
        self.create_account_calls: list[object] = []
        self.create_identity_calls: list[object] = []
        self.update_identity_calls: list[object] = []
        self.mark_authenticated_calls: list[dict] = []

    async def get_wechat_identity_by_openid(self, official_openid: str):
        return self._existing_identity

    async def create_account(self, registration):
        self.create_account_calls.append(registration)
        return _fake_account(registration.account_id)

    async def create_wechat_identity(self, registration):
        self.create_identity_calls.append(registration)
        return registration

    async def update_wechat_identity(self, registration):
        self.update_identity_calls.append(registration)
        return registration

    async def get_wechat_login_session_by_scene_key(self, scene_key: str):
        return self._existing_session

    async def mark_wechat_login_session_authenticated(
        self,
        *,
        login_session_id: int,
        official_openid: str,
        account_id: int,
        issue,
    ):
        self.mark_authenticated_calls.append({
            "login_session_id": login_session_id,
            "official_openid": official_openid,
            "account_id": account_id,
        })
        return None


def _msg(event_type: str, event_key: str | None = None) -> OfficialWechatInboundMessage:
    return OfficialWechatInboundMessage(
        msg_type="event",
        official_openid="camp_openid_1",
        to_user_name="gh_official",
        event_type=event_type,
        event_key=event_key,
        ticket=None,
        content=None,
        message_time=datetime.now(UTC).replace(tzinfo=None),
    )


@pytest.mark.asyncio
async def test_camp_login_scene_unknown_openid_creates_account_and_authenticates_session() -> None:
    """camp-login-* scene + 未知 openid：建 camp 账号 + 绑定身份 + 标记会话 authenticated。"""
    scene_key = "camp-login-42"
    session = _fake_pending_session(scene_key)
    repo = _FakeCampRepo(existing_identity=None, existing_session=session)
    use_case = HandleCampWechatCallbackUseCase(
        account_repository=repo,
        snowflake_id_generator=_StubSnowflake(),
    )

    await use_case.handle_message(_msg("subscribe", scene_key), scene_key)

    assert len(repo.create_account_calls) == 1
    assert len(repo.create_identity_calls) == 1
    assert len(repo.update_identity_calls) == 0
    assert len(repo.mark_authenticated_calls) == 1
    assert repo.mark_authenticated_calls[0]["login_session_id"] == session.login_session_id


@pytest.mark.asyncio
async def test_unsubscribe_unknown_openid_does_nothing() -> None:
    """unsubscribe + 未知 openid：只记 debug，绝不创建任何东西，不报错。"""
    repo = _FakeCampRepo(existing_identity=None)
    use_case = HandleCampWechatCallbackUseCase(
        account_repository=repo,
        snowflake_id_generator=_StubSnowflake(),
    )

    await use_case.handle_message(_msg("unsubscribe", None), None)

    assert repo.create_account_calls == []
    assert repo.create_identity_calls == []
    assert repo.update_identity_calls == []
    assert repo.mark_authenticated_calls == []
