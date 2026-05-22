"""dev-only 假登录用例。

用途：
- 本地联调时绕过微信扫码 + 公众平台回调，直接以指定 username 拿到一对 access/refresh token。
- 仅供开发环境使用；路由层必须在 env=production 时返回 404 / 403 拒绝调用。

行为：
- 按 username find-or-create 一个 ACTIVE 状态的 agent_account；
- 直接复用 issue_agent_auth_tokens 签发 token 与标准 exchange 流程保持一致；
- 不创建任何 wechat_identity / login_session 记录，避免污染真实流水。
"""

from __future__ import annotations

from ..dtos import (
    AgentAccountRegistration,
    AgentAuthenticationResult,
    DevFakeLoginCommand,
)
from ..ports import AgentAccountRepository, TokenService
from ...domain import AgentAccountStatus
from ._session_tokens import issue_agent_auth_tokens


class DevFakeLoginUseCase:
    """Issue tokens for a fixed/specified username without going through WeChat scan."""

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

    async def execute(self, command: DevFakeLoginCommand) -> AgentAuthenticationResult:
        account = await self._account_repository.get_account_by_username(command.username)
        if account is None:
            account = await self._account_repository.create_account(
                AgentAccountRegistration(
                    account_id=self._snowflake_id_generator.generate(),
                    username=command.username,
                    status=AgentAccountStatus.ACTIVE,
                )
            )
        return await issue_agent_auth_tokens(
            account_repository=self._account_repository,
            token_service=self._token_service,
            snowflake_id_generator=self._snowflake_id_generator,
            account=account,
            access_token_ttl_seconds=self._access_token_ttl_seconds,
            refresh_token_ttl_days=self._refresh_token_ttl_days,
        )
