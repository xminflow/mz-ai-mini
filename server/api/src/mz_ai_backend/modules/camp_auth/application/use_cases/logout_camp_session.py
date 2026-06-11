from __future__ import annotations

from ..dtos import LogoutCampSessionCommand, LogoutCampSessionResult
from ..ports import CampAccountRepository, TokenService


class LogoutCampSessionUseCase:
    """Revoke one refresh session."""

    def __init__(
        self,
        *,
        account_repository: CampAccountRepository,
        token_service: TokenService,
    ) -> None:
        self._account_repository = account_repository
        self._token_service = token_service

    async def execute(
        self,
        command: LogoutCampSessionCommand,
    ) -> LogoutCampSessionResult:
        revoked = await self._account_repository.revoke_session_by_refresh_token_hash(
            self._token_service.hash_token(command.refresh_token)
        )
        return LogoutCampSessionResult(revoked=revoked)
