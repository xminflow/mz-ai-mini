from __future__ import annotations

from ..dtos import (
    AgentAccountRegistration,
    AgentWechatIdentityUpsert,
    AgentWechatLoginGrantIssue,
    HandleAgentWechatCallbackCommand,
    normalize_agent_username,
)
from ..ports import AgentAccountRepository, OfficialWechatGateway
from ...domain import (
    AgentAccountStatus,
    AgentWechatCallbackInvalidException,
    AgentWechatLoginSessionStatus,
    AgentWechatSubscribeStatus,
)


class HandleAgentWechatCallbackUseCase:
    """Handle official-account subscribe / scan / unsubscribe callbacks."""

    def __init__(
        self,
        *,
        account_repository: AgentAccountRepository,
        wechat_gateway: OfficialWechatGateway,
        snowflake_id_generator,
    ) -> None:
        self._account_repository = account_repository
        self._wechat_gateway = wechat_gateway
        self._snowflake_id_generator = snowflake_id_generator

    async def execute(self, command: HandleAgentWechatCallbackCommand) -> None:
        valid = self._wechat_gateway.verify_callback_signature(
            signature=command.signature,
            timestamp=command.timestamp,
            nonce=command.nonce,
        )
        if not valid:
            raise AgentWechatCallbackInvalidException(message="WeChat callback signature is invalid.")

        event = self._wechat_gateway.parse_callback_event(command.xml_body)
        openid = event.official_openid
        existing = await self._account_repository.get_wechat_identity_by_openid(openid)
        subscribed = event.event_type in {"subscribe", "SCAN"}
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
            return

        identity_payload = AgentWechatIdentityUpsert(
            identity_id=existing.identity_id if existing is not None else self._snowflake_id_generator.generate(),
            account_id=account_id,
            official_openid=openid,
            subscribe_status=(
                AgentWechatSubscribeStatus.SUBSCRIBED
                if subscribed
                else AgentWechatSubscribeStatus.UNSUBSCRIBED
            ),
            subscribed_at=event.event_time if subscribed else (existing.subscribed_at if existing else None),
            unsubscribed_at=event.event_time if not subscribed else None,
            last_event_at=event.event_time,
        )
        if existing is None:
            await self._account_repository.create_wechat_identity(identity_payload)
        else:
            await self._account_repository.update_wechat_identity(identity_payload)

        if not subscribed:
            return

        scene_key = _normalize_scene_key(event.event_key)
        if scene_key is None:
            return
        login_session = await self._account_repository.get_wechat_login_session_by_scene_key(scene_key)
        if login_session is None or login_session.status != AgentWechatLoginSessionStatus.PENDING:
            return
        await self._account_repository.mark_wechat_login_session_authenticated(
            login_session_id=login_session.login_session_id,
            official_openid=openid,
            account_id=account_id,
            issue=AgentWechatLoginGrantIssue(
                authenticated_at=event.event_time,
            ),
        )


def _normalize_scene_key(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    if normalized.startswith("qrscene_"):
        normalized = normalized[len("qrscene_"):]
    return normalized or None
