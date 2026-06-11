from __future__ import annotations

import logging

from ..dtos import (
    CampAccountRegistration,
    CampWechatIdentityUpsert,
    CampWechatLoginGrantIssue,
    normalize_camp_username,
)
from ..ports import CampAccountRepository
from ...domain import (
    CampAccountStatus,
    CampWechatLoginSessionStatus,
    CampWechatSubscribeStatus,
)
from mz_ai_backend.modules.agent_auth.application.ports.services import OfficialWechatInboundMessage

logger = logging.getLogger(__name__)

# camp 扫码登录 scene 前缀；分发器据此把 camp-login-* 事件路由到本 handler。
LOGIN_SCENE_PREFIX = "camp-login-"


class HandleCampWechatCallbackUseCase:
    """处理分发到 camp 的公众号事件。

    仅两类入口：
    1) 带 camp-login-* scene 的 subscribe/SCAN：绑定 camp 身份（必要时建 camp 账号）+ 标记 camp 登录会话 authenticated。
    2) 无 scene 的 unsubscribe 广播：仅当已存在该 openid 的 camp 身份时标记取关，否则跳过（记 debug，不报错）。
    camp 账号只经 camp 扫码创建，绝不在此为自然关注创建账号、也绝不触碰 agent_* 表。
    """

    def __init__(self, *, account_repository: CampAccountRepository, snowflake_id_generator) -> None:
        self._account_repository = account_repository
        self._snowflake_id_generator = snowflake_id_generator

    async def handle_message(
        self,
        message: OfficialWechatInboundMessage,
        scene_key: str | None,
    ) -> None:
        event_type = message.event_type
        openid = message.official_openid
        if event_type is None or not openid:
            return

        existing = await self._account_repository.get_wechat_identity_by_openid(openid)

        # 取关：仅同步已存在身份，不创建任何东西
        if event_type == "unsubscribe":
            if existing is None:
                logger.debug("camp callback: unsubscribe for unknown openid, skip. openid=%s", openid)
                return
            await self._account_repository.update_wechat_identity(
                CampWechatIdentityUpsert(
                    identity_id=existing.identity_id,
                    account_id=existing.account_id,
                    official_openid=openid,
                    subscribe_status=CampWechatSubscribeStatus.UNSUBSCRIBED,
                    subscribed_at=existing.subscribed_at,
                    unsubscribed_at=message.message_time,
                    last_event_at=message.message_time,
                )
            )
            return

        # 到这里只处理带 camp-login-* scene 的登录事件（subscribe / SCAN）
        if scene_key is None or not scene_key.startswith(LOGIN_SCENE_PREFIX):
            return

        account_id = existing.account_id if existing is not None else None
        if account_id is None:
            generated_account_id = self._snowflake_id_generator.generate()
            account = await self._account_repository.create_account(
                CampAccountRegistration(
                    account_id=generated_account_id,
                    username=normalize_camp_username(f"camp_{generated_account_id}"),
                    status=CampAccountStatus.ACTIVE,
                )
            )
            account_id = account.account_id

        identity_payload = CampWechatIdentityUpsert(
            identity_id=existing.identity_id if existing is not None else self._snowflake_id_generator.generate(),
            account_id=account_id,
            official_openid=openid,
            subscribe_status=CampWechatSubscribeStatus.SUBSCRIBED,
            subscribed_at=message.message_time,
            unsubscribed_at=None,
            last_event_at=message.message_time,
        )
        if existing is None:
            await self._account_repository.create_wechat_identity(identity_payload)
        else:
            await self._account_repository.update_wechat_identity(identity_payload)

        login_session = await self._account_repository.get_wechat_login_session_by_scene_key(scene_key)
        if login_session is not None and login_session.status == CampWechatLoginSessionStatus.PENDING:
            await self._account_repository.mark_wechat_login_session_authenticated(
                login_session_id=login_session.login_session_id,
                official_openid=openid,
                account_id=account_id,
                issue=CampWechatLoginGrantIssue(authenticated_at=message.message_time),
            )
