from __future__ import annotations

from datetime import UTC, datetime

from ..dtos import AgentAccountSummary, GetCurrentAgentAccountQuery
from ..ports import AgentAccountRepository, TokenService
from ...domain import (
    AgentAccessTokenExpiredException,
    AgentAccountDisabledException,
    AgentAccountStatus,
)


class GetCurrentAgentAccountUseCase:
    """Resolve the current account from an access token."""

    def __init__(
        self,
        *,
        account_repository: AgentAccountRepository,
        token_service: TokenService,
    ) -> None:
        self._account_repository = account_repository
        self._token_service = token_service

    async def execute(self, query: GetCurrentAgentAccountQuery) -> AgentAccountSummary:
        token_record = await self._account_repository.get_access_token_record(
            self._token_service.hash_token(query.access_token)
        )
        if token_record is None:
            raise AgentAccessTokenExpiredException()
        now = datetime.now(UTC).replace(tzinfo=None)
        if token_record.expires_at <= now:
            raise AgentAccessTokenExpiredException()

        session = await self._account_repository.get_session_by_id(token_record.session_id)
        if session is None or session.revoked_at is not None:
            raise AgentAccessTokenExpiredException()

        account = await self._account_repository.get_account_by_id(session.account_id)
        if account is None or account.status != AgentAccountStatus.ACTIVE:
            raise AgentAccountDisabledException()
        return AgentAccountSummary(
            account_id=account.account_id,
            username=account.username,
            email=account.email,
            status=account.status,
            created_at=account.created_at,
        )
