from __future__ import annotations

from mz_ai_backend.modules.agent_auth.application.dtos import build_access_token_expiry

from ..dtos import (
    CampWechatLoginSessionCreate,
    CampWechatLoginSessionSummary,
    CreateCampWechatLoginSessionCommand,
    CreateCampWechatLoginSessionResult,
)
from ..ports import CampAccountRepository, OfficialWechatGateway
from ...domain import CampWechatLoginSessionStatus


class CreateCampWechatLoginSessionUseCase:
    """Create one official-account QR login session."""

    def __init__(
        self,
        *,
        account_repository: CampAccountRepository,
        wechat_gateway: OfficialWechatGateway,
        snowflake_id_generator,
        login_session_ttl_seconds: int,
        qr_expire_seconds: int,
        poll_interval_ms: int = 2000,
    ) -> None:
        self._account_repository = account_repository
        self._wechat_gateway = wechat_gateway
        self._snowflake_id_generator = snowflake_id_generator
        self._login_session_ttl_seconds = login_session_ttl_seconds
        self._qr_expire_seconds = qr_expire_seconds
        self._poll_interval_ms = poll_interval_ms

    async def execute(
        self,
        _command: CreateCampWechatLoginSessionCommand,
    ) -> CreateCampWechatLoginSessionResult:
        login_session_id = self._snowflake_id_generator.generate()
        scene_key = f"camp-login-{login_session_id}"
        qr_ticket = await self._wechat_gateway.create_temporary_qr_ticket(
            scene_key=scene_key,
            expire_seconds=min(self._login_session_ttl_seconds, self._qr_expire_seconds),
        )
        session = await self._account_repository.create_wechat_login_session(
            CampWechatLoginSessionCreate(
                login_session_id=login_session_id,
                scene_key=scene_key,
                status=CampWechatLoginSessionStatus.PENDING,
                expires_at=build_access_token_expiry(
                    ttl_seconds=min(self._login_session_ttl_seconds, qr_ticket.expires_in_seconds)
                ),
            )
        )
        return CreateCampWechatLoginSessionResult(
            session=CampWechatLoginSessionSummary(
                login_session_id=session.login_session_id,
                status=session.status,
                qr_code_url=qr_ticket.qr_code_url,
                expires_at=session.expires_at,
                poll_interval_ms=self._poll_interval_ms,
            )
        )
