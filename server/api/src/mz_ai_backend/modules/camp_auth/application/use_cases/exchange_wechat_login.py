from __future__ import annotations

from datetime import UTC, datetime

from ..dtos import ExchangeCampWechatLoginCommand
from ..ports import CampAccountRepository, TokenService
from ...domain import (
    CampAccountDisabledException,
    CampAccountStatus,
    CampWechatIdentityNotSubscribedException,
    CampWechatLoginSessionExpiredException,
    CampWechatLoginSessionPendingException,
    CampWechatLoginSessionStatus,
    CampWechatSubscribeStatus,
)
from ._session_tokens import issue_camp_auth_tokens


class ExchangeCampWechatLoginUseCase:
    """Exchange one authenticated QR login session for standard auth tokens."""

    def __init__(
        self,
        *,
        account_repository: CampAccountRepository,
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

    async def execute(self, command: ExchangeCampWechatLoginCommand):
        session = await self._account_repository.get_wechat_login_session_by_id(
            command.login_session_id
        )
        if session is None:
            raise CampWechatLoginSessionExpiredException()
        now = datetime.now(UTC).replace(tzinfo=None)
        if session.expires_at <= now or session.status == CampWechatLoginSessionStatus.EXPIRED:
            raise CampWechatLoginSessionExpiredException()
        if session.status == CampWechatLoginSessionStatus.PENDING:
            raise CampWechatLoginSessionPendingException()
        if session.status == CampWechatLoginSessionStatus.CONSUMED:
            raise CampWechatLoginSessionExpiredException()
        if session.account_id is None or session.official_openid is None:
            raise CampWechatLoginSessionPendingException()

        identity = await self._account_repository.get_wechat_identity_by_openid(
            session.official_openid
        )
        if identity is None or identity.subscribe_status != CampWechatSubscribeStatus.SUBSCRIBED:
            raise CampWechatIdentityNotSubscribedException()

        account = await self._account_repository.get_account_by_id(session.account_id)
        if account is None or account.status != CampAccountStatus.ACTIVE:
            raise CampAccountDisabledException()

        await self._account_repository.mark_wechat_login_session_consumed(
            login_session_id=session.login_session_id
        )
        return await issue_camp_auth_tokens(
            account_repository=self._account_repository,
            token_service=self._token_service,
            snowflake_id_generator=self._snowflake_id_generator,
            account=account,
            access_token_ttl_seconds=self._access_token_ttl_seconds,
            refresh_token_ttl_days=self._refresh_token_ttl_days,
        )
