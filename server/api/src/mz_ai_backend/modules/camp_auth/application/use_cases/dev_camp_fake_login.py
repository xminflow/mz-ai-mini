"""dev-only 免微信假登录用例。

按 username find-or-create 一个 ACTIVE camp 账号；可选强制设置会员 tier（基础/高级），
再复用标准 issue_camp_auth_tokens 签发 token。不创建任何微信身份/登录会话记录。
仅供开发环境；路由层须在 env=production 时 404 拒绝调用。
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from mz_ai_backend.shared import SnowflakeGenerator

from ..dtos import CampAccountRegistration, CampAuthenticationResult, DevCampFakeLoginCommand
from ..ports import CampAccountRepository, TokenService
from ...domain import CampAccountStatus
from ._session_tokens import issue_camp_auth_tokens

_DEV_MEMBERSHIP_TTL_DAYS = 365


class DevCampFakeLoginUseCase:
    """Issue camp tokens for a username without WeChat scan, optionally granting a tier."""

    def __init__(
        self,
        *,
        account_repository: CampAccountRepository,
        token_service: TokenService,
        snowflake_id_generator: SnowflakeGenerator,
        access_token_ttl_seconds: int,
        refresh_token_ttl_days: int,
    ) -> None:
        self._account_repository = account_repository
        self._token_service = token_service
        self._snowflake_id_generator = snowflake_id_generator
        self._access_token_ttl_seconds = access_token_ttl_seconds
        self._refresh_token_ttl_days = refresh_token_ttl_days

    async def execute(self, command: DevCampFakeLoginCommand) -> CampAuthenticationResult:
        account = await self._account_repository.get_account_by_username(command.username)
        if account is None:
            account = await self._account_repository.create_account(
                CampAccountRegistration(
                    account_id=self._snowflake_id_generator.generate(),
                    username=command.username,
                    status=CampAccountStatus.ACTIVE,
                )
            )
        if command.tier != "none":
            now = datetime.now(UTC).replace(tzinfo=None)
            await self._account_repository.set_membership(
                account_id=account.account_id,
                tier=command.tier,
                started_at=now,
                expires_at=now + timedelta(days=_DEV_MEMBERSHIP_TTL_DAYS),
            )
        return await issue_camp_auth_tokens(
            account_repository=self._account_repository,
            token_service=self._token_service,
            snowflake_id_generator=self._snowflake_id_generator,
            account=account,
            access_token_ttl_seconds=self._access_token_ttl_seconds,
            refresh_token_ttl_days=self._refresh_token_ttl_days,
        )
