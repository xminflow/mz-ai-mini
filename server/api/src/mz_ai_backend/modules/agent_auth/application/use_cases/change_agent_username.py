from __future__ import annotations

import logging

from ..dtos import (
    AgentAccountSummary,
    ChangeAgentUsernameCommand,
    ChangeAgentUsernameResult,
)
from ..ports import AgentAccountRepository, TokenService
from ..use_cases._resolve_current_account import resolve_current_account_id
from ...domain import AgentUsernameTakenException

logger = logging.getLogger(__name__)


class ChangeAgentUsernameUseCase:
    """修改当前登录账号的用户名。

    用户名格式（3-32 个 a-z / 0-9 / 下划线）由 ChangeAgentUsernameCommand 校验完成；
    本 use case 只负责权限解析 + 持久化（unique 冲突由仓储抛 AgentUsernameTakenException）。
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
        command: ChangeAgentUsernameCommand,
    ) -> ChangeAgentUsernameResult:
        account_id = await resolve_current_account_id(
            account_repository=self._account_repository,
            token_service=self._token_service,
            access_token=command.access_token,
        )
        updated = await self._account_repository.update_account_username(
            account_id=account_id,
            username=command.new_username,
        )
        if updated is None:
            # 账号并发删除等极端场景；按 username 冲突语义返回，前端能感知重试。
            raise AgentUsernameTakenException()
        logger.debug(
            "用户名修改成功：account_id=%s new_username=%s",
            account_id,
            command.new_username,
        )
        return ChangeAgentUsernameResult(
            account=AgentAccountSummary(
                account_id=updated.account_id,
                username=updated.username,
                email=updated.email,
                status=updated.status,
                created_at=updated.created_at,
            )
        )
