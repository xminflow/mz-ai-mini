from __future__ import annotations

import logging
from datetime import UTC, datetime

from ..dtos import (
    AgentAccountSummary,
    VerifyEmailBindingChallengeCommand,
    VerifyEmailBindingChallengeResult,
)
from ..ports import AgentAccountRepository, TokenService
from ..use_cases._resolve_current_account import resolve_current_account_id
from ...domain import (
    AgentEmailLoginChallengeExpiredException,
    AgentEmailLoginCodeInvalidException,
    AgentEmailTakenException,
)

logger = logging.getLogger(__name__)


class VerifyEmailBindingChallengeUseCase:
    """验证邮箱绑定验证码并把邮箱写到当前账号上。

    流程：
    1. 校验 access_token → 拿到 account_id。
    2. 校验 challenge 有效（未过期/未消费/未作废）+ 验证码哈希匹配。
    3. mark_verified → update_account_email（依赖 email UNIQUE 索引并发兜底）。
    4. 返回更新后的 account summary。
    """

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
        command: VerifyEmailBindingChallengeCommand,
    ) -> VerifyEmailBindingChallengeResult:
        account_id = await resolve_current_account_id(
            account_repository=self._account_repository,
            token_service=self._token_service,
            access_token=command.access_token,
        )

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

        # 防御性二次检查：在 verify 这一刻邮箱是否已被别的账号占用。
        existing_account = await self._account_repository.get_account_by_email(challenge.email)
        if existing_account is not None and existing_account.account_id != account_id:
            raise AgentEmailTakenException()

        await self._account_repository.mark_email_login_challenge_verified(
            login_challenge_id=challenge.login_challenge_id,
            verified_at=now,
        )
        updated_account = await self._account_repository.update_account_email(
            account_id=account_id,
            email=challenge.email,
        )
        if updated_account is None:
            # 账户被并发删除等极端情况；返回 challenge 过期错误让前端重试。
            raise AgentEmailLoginChallengeExpiredException()

        logger.debug(
            "邮箱绑定成功：account_id=%s email=%s challenge_id=%s",
            account_id,
            challenge.email,
            challenge.login_challenge_id,
        )
        return VerifyEmailBindingChallengeResult(
            account=AgentAccountSummary(
                account_id=updated_account.account_id,
                username=updated_account.username,
                email=updated_account.email,
                status=updated_account.status,
                created_at=updated_account.created_at,
            )
        )
