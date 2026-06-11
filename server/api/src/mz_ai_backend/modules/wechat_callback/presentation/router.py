from typing import Annotated
from fastapi import APIRouter, Depends, Query, Request, Response

from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import get_official_wechat_gateway
from mz_ai_backend.modules.agent_auth.infrastructure.wechat_official import WechatOfficialAccountGateway
from mz_ai_backend.modules.agent_auth.application.dtos import HandleAgentWechatCallbackCommand
from ..application.dispatcher import WechatCallbackDispatcher
from ..infrastructure.dependencies import get_wechat_callback_dispatcher

router = APIRouter(tags=["wechat-callback"])


@router.get("/agent-auth/wechat-official/callback", summary="WeChat callback verification")
async def verify_wechat_callback(
    signature: str | None = Query(default=None),
    timestamp: str | None = Query(default=None),
    nonce: str | None = Query(default=None),
    echostr: str | None = Query(default=None),
    gateway: Annotated[WechatOfficialAccountGateway, Depends(get_official_wechat_gateway)] = None,
) -> Response:
    if gateway is None:
        return Response(content="", media_type="text/plain")
    valid = gateway.verify_callback_signature(signature=signature, timestamp=timestamp, nonce=nonce)
    return Response(content=echostr if valid and echostr is not None else "", media_type="text/plain")


@router.post("/agent-auth/wechat-official/callback", summary="WeChat callback events (dispatched)")
async def handle_wechat_callback(
    request: Request,
    dispatcher: Annotated[WechatCallbackDispatcher, Depends(get_wechat_callback_dispatcher)],
    signature: str | None = Query(default=None),
    msg_signature: str | None = Query(default=None),
    timestamp: str | None = Query(default=None),
    nonce: str | None = Query(default=None),
) -> Response:
    body = (await request.body()).decode("utf-8")
    reply = await dispatcher.dispatch(
        HandleAgentWechatCallbackCommand(
            signature=signature, msg_signature=msg_signature,
            timestamp=timestamp, nonce=nonce, xml_body=body,
        )
    )
    if reply:
        return Response(content=reply, media_type="application/xml")
    return Response(content="success", media_type="text/plain")
