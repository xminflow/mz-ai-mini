from __future__ import annotations

from datetime import UTC, datetime

from ..dtos import AgentWechatLoginSessionStatusResult, GetAgentWechatLoginSessionQuery
from ..ports import AgentAccountRepository
from ...domain import (
    AgentWechatLoginSessionExpiredException,
    AgentWechatLoginSessionStatus,
)


class GetAgentWechatLoginSessionUseCase:
    """Resolve the current state of one QR login session."""

    def __init__(self, *, account_repository: AgentAccountRepository) -> None:
        self._account_repository = account_repository

    async def execute(
        self,
        query: GetAgentWechatLoginSessionQuery,
    ) -> AgentWechatLoginSessionStatusResult:
        session = await self._account_repository.get_wechat_login_session_by_id(
            query.login_session_id
        )
        if session is None:
            raise AgentWechatLoginSessionExpiredException()
        now = datetime.now(UTC).replace(tzinfo=None)
        if session.status == AgentWechatLoginSessionStatus.PENDING and session.expires_at <= now:
            session = await self._account_repository.mark_wechat_login_session_expired(
                login_session_id=session.login_session_id
            ) or session.model_copy(update={"status": AgentWechatLoginSessionStatus.EXPIRED})
        return AgentWechatLoginSessionStatusResult(
            login_session_id=session.login_session_id,
            status=session.status,
            expires_at=session.expires_at,
        )
