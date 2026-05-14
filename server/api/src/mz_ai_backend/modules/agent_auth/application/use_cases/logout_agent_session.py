from __future__ import annotations

from ..dtos import LogoutAgentSessionCommand, LogoutAgentSessionResult
from ..ports import AgentAccountRepository, TokenService


class LogoutAgentSessionUseCase:
    """Revoke one refresh session."""

    def __init__(
        self,
        *,
        account_repository: AgentAccountRepository,
        token_service: TokenService,
    ) -> None:
        self._account_repository = account_repository
        self._token_service = token_service

    async def execute(
        self,
        command: LogoutAgentSessionCommand,
    ) -> LogoutAgentSessionResult:
        revoked = await self._account_repository.revoke_session_by_refresh_token_hash(
            self._token_service.hash_token(command.refresh_token)
        )
        return LogoutAgentSessionResult(revoked=revoked)
