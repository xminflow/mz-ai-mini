from __future__ import annotations

from datetime import UTC, datetime
from secrets import randbelow

from ..dtos import (
    AgentEmailLoginChallengeCreate,
    AgentEmailLoginChallengeSummary,
    RequestAgentEmailLoginChallengeCommand,
    RequestAgentEmailLoginChallengeResult,
    build_access_token_expiry,
)
from ..ports import AgentAccountRepository, EmailLoginDeliveryGateway, TokenService
from ...domain import AgentEmailSendCooldownException


class RequestAgentEmailLoginChallengeUseCase:
    """Create and deliver one email login challenge."""

    def __init__(
        self,
        *,
        account_repository: AgentAccountRepository,
        token_service: TokenService,
        email_delivery_gateway: EmailLoginDeliveryGateway,
        snowflake_id_generator,
        code_ttl_seconds: int,
        send_cooldown_seconds: int,
    ) -> None:
        self._account_repository = account_repository
        self._token_service = token_service
        self._email_delivery_gateway = email_delivery_gateway
        self._snowflake_id_generator = snowflake_id_generator
        self._code_ttl_seconds = code_ttl_seconds
        self._send_cooldown_seconds = send_cooldown_seconds

    async def execute(
        self,
        command: RequestAgentEmailLoginChallengeCommand,
    ) -> RequestAgentEmailLoginChallengeResult:
        latest = await self._account_repository.get_latest_email_login_challenge_by_email(
            command.email
        )
        now = datetime.now(UTC).replace(tzinfo=None)
        if latest is not None and (now - latest.created_at).total_seconds() < self._send_cooldown_seconds:
            retry_after_seconds = max(
                1,
                self._send_cooldown_seconds - int((now - latest.created_at).total_seconds()),
            )
            raise AgentEmailSendCooldownException(retry_after_seconds=retry_after_seconds)

        await self._account_repository.invalidate_active_email_login_challenges_by_email(
            email=command.email
        )
        verification_code = f"{randbelow(1_000_000):06d}"
        challenge = await self._account_repository.create_email_login_challenge(
            AgentEmailLoginChallengeCreate(
                login_challenge_id=self._snowflake_id_generator.generate(),
                email=command.email,
                code_hash=self._token_service.hash_token(verification_code),
                expires_at=build_access_token_expiry(ttl_seconds=self._code_ttl_seconds),
            )
        )
        await self._email_delivery_gateway.send_login_code(
            email=command.email,
            verification_code=verification_code,
        )
        return RequestAgentEmailLoginChallengeResult(
            challenge=AgentEmailLoginChallengeSummary(
                login_challenge_id=challenge.login_challenge_id,
                expires_at=challenge.expires_at,
                cooldown_seconds=self._send_cooldown_seconds,
            )
        )
