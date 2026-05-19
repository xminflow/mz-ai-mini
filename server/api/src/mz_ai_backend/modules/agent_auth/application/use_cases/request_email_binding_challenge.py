from __future__ import annotations

import logging
from datetime import UTC, datetime
from secrets import randbelow

from ..dtos import (
    AgentEmailVerificationChallengeCreate,
    AgentEmailVerificationChallengeSummary,
    RequestEmailBindingChallengeCommand,
    RequestEmailBindingChallengeResult,
    build_access_token_expiry,
)
from ..ports import AgentAccountRepository, EmailVerificationDeliveryGateway, TokenService
from ..use_cases._resolve_current_account import resolve_current_account_id
from ...domain import (
    AgentEmailSendCooldownException,
    AgentEmailTakenException,
)

logger = logging.getLogger(__name__)


class RequestEmailBindingChallengeUseCase:
    """为已登录用户发送邮箱绑定验证码。

    流程：
    1. 校验 access_token → 拿到当前 account_id。
    2. 校验目标 email 没有被别的账号占用（自己已绑定同一邮箱时允许重新发码，幂等）。
    3. 按 send_cooldown 限速；旧 challenge 设为 invalidated。
    4. 生成 6 位验证码 → 存 challenge → 发邮件。
    """

    def __init__(
        self,
        *,
        account_repository: AgentAccountRepository,
        token_service: TokenService,
        email_delivery_gateway: EmailVerificationDeliveryGateway,
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
        command: RequestEmailBindingChallengeCommand,
    ) -> RequestEmailBindingChallengeResult:
        account_id = await resolve_current_account_id(
            account_repository=self._account_repository,
            token_service=self._token_service,
            access_token=command.access_token,
        )

        # 同邮箱已绑定到别的账号则直接拒绝，不浪费一次发码。
        existing_account = await self._account_repository.get_account_by_email(command.email)
        if existing_account is not None and existing_account.account_id != account_id:
            logger.info(
                "邮箱绑定冲突：email=%s 已绑 account_id=%s，请求方 account_id=%s",
                command.email,
                existing_account.account_id,
                account_id,
            )
            raise AgentEmailTakenException()

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
            AgentEmailVerificationChallengeCreate(
                login_challenge_id=self._snowflake_id_generator.generate(),
                email=command.email,
                code_hash=self._token_service.hash_token(verification_code),
                expires_at=build_access_token_expiry(ttl_seconds=self._code_ttl_seconds),
            )
        )
        await self._email_delivery_gateway.send_verification_code(
            email=command.email,
            verification_code=verification_code,
        )
        logger.debug(
            "邮箱绑定验证码已下发：account_id=%s email=%s challenge_id=%s",
            account_id,
            command.email,
            challenge.login_challenge_id,
        )
        return RequestEmailBindingChallengeResult(
            challenge=AgentEmailVerificationChallengeSummary(
                login_challenge_id=challenge.login_challenge_id,
                expires_at=challenge.expires_at,
                cooldown_seconds=self._send_cooldown_seconds,
            )
        )
