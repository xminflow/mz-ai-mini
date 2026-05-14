from __future__ import annotations

from datetime import UTC, datetime

from ..dtos import (
    AgentAccountRegistration,
    VerifyAgentEmailLoginChallengeCommand,
    normalize_agent_username,
)
from ..ports import AgentAccountRepository, TokenService
from ..use_cases._session_tokens import issue_agent_auth_tokens
from ...domain import (
    AgentAccountDisabledException,
    AgentAccountStatus,
    AgentEmailLoginChallengeExpiredException,
    AgentEmailLoginCodeInvalidException,
)


class VerifyAgentEmailLoginChallengeUseCase:
    """Verify one email login challenge and issue ua-agent tokens."""

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

    async def execute(self, command: VerifyAgentEmailLoginChallengeCommand):
        challenge = await self._account_repository.get_email_login_challenge_by_id(
            command.login_challenge_id
        )
        now = datetime.now(UTC).replace(tzinfo=None)
        if (
            challenge is None
            or challenge.verified_at is not None
            or challenge.invalidated_at is not None
            or challenge.expires_at <= now
        ):
            raise AgentEmailLoginChallengeExpiredException()
        if self._token_service.hash_token(command.verification_code) != challenge.code_hash:
            raise AgentEmailLoginCodeInvalidException()

        await self._account_repository.mark_email_login_challenge_verified(
            login_challenge_id=challenge.login_challenge_id,
            verified_at=now,
        )
        account = await self._account_repository.get_account_by_email(challenge.email)
        if account is None:
            account_id = self._snowflake_id_generator.generate()
            account = await self._account_repository.create_account(
                AgentAccountRegistration(
                    account_id=account_id,
                    username=normalize_agent_username(f"agent_{account_id}"),
                    email=challenge.email,
                    status=AgentAccountStatus.ACTIVE,
                )
            )
        if account.status != AgentAccountStatus.ACTIVE:
            raise AgentAccountDisabledException()

        return await issue_agent_auth_tokens(
            account_repository=self._account_repository,
            token_service=self._token_service,
            snowflake_id_generator=self._snowflake_id_generator,
            account=account,
            access_token_ttl_seconds=self._access_token_ttl_seconds,
            refresh_token_ttl_days=self._refresh_token_ttl_days,
        )
