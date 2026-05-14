from __future__ import annotations

from datetime import UTC, datetime

from ..dtos import (
    AgentAccountSummary,
    AgentAuthenticationResult,
    AgentTokenPair,
    RefreshAgentSessionCommand,
    build_access_token_expiry,
    build_refresh_token_expiry,
)
from ..ports import AgentAccountRepository, TokenService
from ...domain import (
    AgentAccountDisabledException,
    AgentAccountStatus,
    AgentRefreshTokenExpiredException,
    AgentSessionRevokedException,
)


class RefreshAgentSessionUseCase:
    """Rotate tokens for one valid refresh session."""

    def __init__(
        self,
        *,
        account_repository: AgentAccountRepository,
        token_service: TokenService,
        snowflake_id_generator,
        access_token_ttl_seconds: int,
        refresh_token_ttl_days: int,
    ) -> None:
        self._account_repository = account_repository
        self._token_service = token_service
        self._snowflake_id_generator = snowflake_id_generator
        self._access_token_ttl_seconds = access_token_ttl_seconds
        self._refresh_token_ttl_days = refresh_token_ttl_days

    async def execute(
        self,
        command: RefreshAgentSessionCommand,
    ) -> AgentAuthenticationResult:
        refresh_token_hash = self._token_service.hash_token(command.refresh_token)
        session = await self._account_repository.get_session_by_refresh_token_hash(
            refresh_token_hash
        )
        if session is None:
            raise AgentRefreshTokenExpiredException()
        if session.revoked_at is not None:
            raise AgentSessionRevokedException()
        now = datetime.now(UTC).replace(tzinfo=None)
        if session.expires_at <= now:
            raise AgentRefreshTokenExpiredException()

        account = await self._account_repository.get_account_by_id(session.account_id)
        if account is None or account.status != AgentAccountStatus.ACTIVE:
            raise AgentAccountDisabledException()

        access_token = self._token_service.generate_token()
        refresh_token = self._token_service.generate_token()
        access_token_expires_at = build_access_token_expiry(
            ttl_seconds=self._access_token_ttl_seconds
        )
        refresh_token_expires_at = build_refresh_token_expiry(
            ttl_days=self._refresh_token_ttl_days
        )
        await self._account_repository.replace_session_tokens(
            session_id=session.session_id,
            refresh_token_hash=self._token_service.hash_token(refresh_token),
            refresh_token_expires_at=refresh_token_expires_at,
            access_token_id=self._snowflake_id_generator.generate(),
            access_token_hash=self._token_service.hash_token(access_token),
            access_token_expires_at=access_token_expires_at,
        )
        return AgentAuthenticationResult(
            account=AgentAccountSummary(
                account_id=account.account_id,
                username=account.username,
                email=account.email,
                status=account.status,
                created_at=account.created_at,
            ),
            tokens=AgentTokenPair(
                access_token=access_token,
                access_token_expires_at=access_token_expires_at,
                refresh_token=refresh_token,
                refresh_token_expires_at=refresh_token_expires_at,
            ),
        )
