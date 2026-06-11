from __future__ import annotations

import logging

from ..dtos import (
    AgentAccountRegistration,
    AgentWechatIdentityUpsert,
    AgentWechatLoginGrantIssue,
    HandleAgentWechatCallbackCommand,
    normalize_agent_username,
)
from ..ports import AgentAccountRepository, OfficialWechatGateway, OfficialWechatInboundMessage
from ...domain import (
    AgentAccountStatus,
    AgentWechatCallbackInvalidException,
    AgentWechatLoginSessionStatus,
    AgentWechatSubscribeStatus,
)

logger = logging.getLogger(__name__)

# 扫码登录二维码的 scene 前缀：create_wechat_login_session 生成 scene_key="agent-login-{id}"。
# 用于区分"普通关注"与"扫码登录引发的关注"，后者不发送社群邀请，避免打扰登录流程。
_LOGIN_SCENE_PREFIX = "agent-login-"


class HandleAgentWechatCallbackUseCase:
    """Handle official-account subscribe / scan / unsubscribe callbacks.

    职责：① 维护公众号身份绑定与扫码登录会话；② 关注事件返回单图文被动回复（社群邀请+二维码）。
    被动回复直接作为回调 HTTP 响应体返回（execute 的返回值），对 subscribe 无 48h 客服窗口限制；
    选用被动回复而非客服接口，是因为"关注"动作不会打开客服接口的 48h 窗口（实测 45015）。
    """

    def __init__(
        self,
        *,
        account_repository: AgentAccountRepository,
        wechat_gateway: OfficialWechatGateway,
        snowflake_id_generator,
        auto_reply_enabled: bool = False,
        auto_reply_subscribe_news_title: str | None = None,
        auto_reply_subscribe_news_description: str | None = None,
        auto_reply_subscribe_news_pic_url: str | None = None,
        auto_reply_subscribe_news_url: str | None = None,
    ) -> None:
        self._account_repository = account_repository
        self._wechat_gateway = wechat_gateway
        self._snowflake_id_generator = snowflake_id_generator
        self._auto_reply_enabled = auto_reply_enabled
        self._auto_reply_news_title = auto_reply_subscribe_news_title
        self._auto_reply_news_description = auto_reply_subscribe_news_description
        self._auto_reply_news_pic_url = auto_reply_subscribe_news_pic_url
        self._auto_reply_news_url = auto_reply_subscribe_news_url

    async def execute(self, command: HandleAgentWechatCallbackCommand) -> str | None:
        """处理回调并返回被动回复 XML（无回复时返回 None，路由层据此回 "success"）。"""
        # 安全模式使用 msg_signature（含加密内容参与签名），明文模式使用 signature
        if command.msg_signature:
            valid = self._wechat_gateway.verify_msg_signature(
                msg_signature=command.msg_signature,
                timestamp=command.timestamp,
                nonce=command.nonce,
                xml_body=command.xml_body,
            )
        else:
            valid = self._wechat_gateway.verify_callback_signature(
                signature=command.signature,
                timestamp=command.timestamp,
                nonce=command.nonce,
            )
        if not valid:
            raise AgentWechatCallbackInvalidException(message="WeChat callback signature is invalid.")

        message = self._wechat_gateway.parse_inbound_message(command.xml_body)
        # 仅事件消息参与身份绑定/登录/自动回复；普通消息（文本/图片等）直接返回，回调回 success
        if message.msg_type != "event" or message.event_type is None:
            logger.debug(
                "WeChat inbound non-event message ignored: msg_type=%s openid=%s",
                message.msg_type,
                message.official_openid,
            )
            return None

        scene_key = _normalize_scene_key(message.event_key)
        return await self.handle_message(message, scene_key)

    async def handle_message(
        self,
        message: OfficialWechatInboundMessage,
        scene_key: str | None,
    ) -> str | None:
        """处理已解析的事件消息，返回被动回复 XML 或 None。

        scene_key MUST already be normalized (qrscene_ prefix stripped) by the caller;
        None if absent. execute() and the shared WechatCallbackDispatcher both normalize
        before calling.
        """
        event_type = message.event_type
        openid = message.official_openid
        existing = await self._account_repository.get_wechat_identity_by_openid(openid)
        subscribed = event_type in {"subscribe", "SCAN"}
        account_id = existing.account_id if existing is not None else None

        if subscribed and account_id is None:
            generated_account_id = self._snowflake_id_generator.generate()
            account = await self._account_repository.create_account(
                AgentAccountRegistration(
                    account_id=generated_account_id,
                    username=normalize_agent_username(f"wxoa_{generated_account_id}"),
                    status=AgentAccountStatus.ACTIVE,
                )
            )
            account_id = account.account_id

        if account_id is None:
            return None

        identity_payload = AgentWechatIdentityUpsert(
            identity_id=existing.identity_id if existing is not None else self._snowflake_id_generator.generate(),
            account_id=account_id,
            official_openid=openid,
            subscribe_status=(
                AgentWechatSubscribeStatus.SUBSCRIBED
                if subscribed
                else AgentWechatSubscribeStatus.UNSUBSCRIBED
            ),
            subscribed_at=message.message_time if subscribed else (existing.subscribed_at if existing else None),
            unsubscribed_at=message.message_time if not subscribed else None,
            last_event_at=message.message_time,
        )
        if existing is None:
            await self._account_repository.create_wechat_identity(identity_payload)
        else:
            await self._account_repository.update_wechat_identity(identity_payload)

        if not subscribed:
            return None

        is_login_scene = scene_key is not None and scene_key.startswith(_LOGIN_SCENE_PREFIX)

        # 自动回复：仅"关注(subscribe)"触发，且排除扫码登录引发的关注（不打扰登录用户）。
        # SCAN（已关注用户再次扫码）属于登录动作，同样不触发。
        reply: str | None = None
        if event_type == "subscribe" and not is_login_scene:
            reply = self._build_subscribe_reply(message)

        if scene_key is not None:
            login_session = await self._account_repository.get_wechat_login_session_by_scene_key(scene_key)
            if login_session is not None and login_session.status == AgentWechatLoginSessionStatus.PENDING:
                await self._account_repository.mark_wechat_login_session_authenticated(
                    login_session_id=login_session.login_session_id,
                    official_openid=openid,
                    account_id=account_id,
                    issue=AgentWechatLoginGrantIssue(
                        authenticated_at=message.message_time,
                    ),
                )

        return reply

    def _build_subscribe_reply(self, message: OfficialWechatInboundMessage) -> str | None:
        """构造关注的单图文被动回复；未启用或未配置内容时返回 None。"""
        if not self._auto_reply_enabled:
            return None
        title = self._auto_reply_news_title
        description = self._auto_reply_news_description
        pic_url = self._auto_reply_news_pic_url
        if not title and not description and not pic_url:
            logger.warning(
                "WeChat subscribe auto-reply enabled but news content not configured; skip. openid=%s",
                message.official_openid,
            )
            return None
        reply = self._wechat_gateway.build_subscribe_news_reply(
            to_user_openid=message.official_openid,
            from_user_name=message.to_user_name,
            title=title or "",
            description=description or "",
            pic_url=pic_url or "",
            # Url 未配置时回退到图片地址，保证点击卡片能看到二维码
            url=self._auto_reply_news_url or pic_url or "",
        )
        logger.info("WeChat subscribe news reply built: openid=%s", message.official_openid)
        return reply


def _normalize_scene_key(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    if normalized.startswith("qrscene_"):
        normalized = normalized[len("qrscene_"):]
    return normalized or None
