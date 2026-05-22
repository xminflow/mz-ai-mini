from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import get_settings_dependency
from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import (
    ChangeAgentUsernameUseCase,
    CreateAgentWechatLoginSessionCommand,
    CreateAgentWechatLoginSessionUseCase,
    DevFakeLoginUseCase,
    ExchangeAgentWechatLoginUseCase,
    GetCurrentAgentAccountQuery,
    GetCurrentAgentAccountUseCase,
    GetAgentWechatLoginSessionQuery,
    GetAgentWechatLoginSessionUseCase,
    HandleAgentWechatCallbackCommand,
    HandleAgentWechatCallbackUseCase,
    LogoutAgentSessionUseCase,
    RefreshAgentSessionUseCase,
    RequestEmailBindingChallengeUseCase,
    VerifyEmailBindingChallengeUseCase,
)
from ..infrastructure import (
    get_change_agent_username_use_case,
    get_create_wechat_login_session_use_case,
    get_current_agent_access_token,
    get_dev_fake_login_use_case,
    get_exchange_wechat_login_use_case,
    get_get_current_agent_account_use_case,
    get_get_wechat_login_session_use_case,
    get_handle_wechat_callback_use_case,
    get_logout_agent_session_use_case,
    get_refresh_agent_session_use_case,
    get_request_email_binding_challenge_use_case,
    get_verify_email_binding_challenge_use_case,
)
from ..infrastructure.dependencies import get_official_wechat_gateway
from ..infrastructure.wechat_official import WechatOfficialAccountGateway
from .schemas import (
    AgentAuthAccountResponse,
    AgentAuthenticationResponse,
    AgentWechatLoginSessionResponse,
    AgentWechatLoginSessionStatusResponse,
    ChangeAgentUsernameRequest,
    ChangeAgentUsernameResponse,
    DevFakeLoginRequest,
    EmailBindingChallengeResponse,
    ExchangeAgentWechatLoginRequest,
    LogoutAgentSessionRequest,
    LogoutAgentSessionResponse,
    RefreshAgentSessionRequest,
    RequestEmailBindingChallengeRequest,
    VerifyEmailBindingChallengeRequest,
    VerifyEmailBindingChallengeResponse,
)


router = APIRouter(prefix="/agent-auth", tags=["agent-auth"])


@router.post(
    "/refresh",
    response_model=ApiResponse[AgentAuthenticationResponse],
    summary="Refresh one ua-agent session",
)
async def refresh_agent_session(
    request: RefreshAgentSessionRequest,
    use_case: Annotated[
        RefreshAgentSessionUseCase,
        Depends(get_refresh_agent_session_use_case),
    ],
) -> ApiResponse[AgentAuthenticationResponse]:
    result = await use_case.execute(request.to_command())
    return success_response(data=AgentAuthenticationResponse.from_result(result))


@router.post(
    "/logout",
    response_model=ApiResponse[LogoutAgentSessionResponse],
    summary="Revoke one ua-agent session",
)
async def logout_agent_session(
    request: LogoutAgentSessionRequest,
    use_case: Annotated[
        LogoutAgentSessionUseCase,
        Depends(get_logout_agent_session_use_case),
    ],
) -> ApiResponse[LogoutAgentSessionResponse]:
    result = await use_case.execute(request.to_command())
    return success_response(data=LogoutAgentSessionResponse.from_result(result))


@router.get(
    "/me",
    response_model=ApiResponse[AgentAuthAccountResponse],
    summary="Get the current ua-agent account",
)
async def get_current_agent_account(
    access_token: Annotated[str, Depends(get_current_agent_access_token)],
    use_case: Annotated[
        GetCurrentAgentAccountUseCase,
        Depends(get_get_current_agent_account_use_case),
    ],
) -> ApiResponse[AgentAuthAccountResponse]:
    result = await use_case.execute(GetCurrentAgentAccountQuery(access_token=access_token))
    return success_response(data=AgentAuthAccountResponse.from_summary(result))


@router.post(
    "/me/email-binding/challenges",
    response_model=ApiResponse[EmailBindingChallengeResponse],
    summary="为当前账号请求邮箱绑定验证码",
)
async def request_email_binding_challenge(
    request: RequestEmailBindingChallengeRequest,
    access_token: Annotated[str, Depends(get_current_agent_access_token)],
    use_case: Annotated[
        RequestEmailBindingChallengeUseCase,
        Depends(get_request_email_binding_challenge_use_case),
    ],
) -> ApiResponse[EmailBindingChallengeResponse]:
    result = await use_case.execute(request.to_command(access_token=access_token))
    return success_response(data=EmailBindingChallengeResponse.from_result(result))


@router.post(
    "/me/email-binding/challenges/{login_challenge_id}/verify",
    response_model=ApiResponse[VerifyEmailBindingChallengeResponse],
    summary="验证邮箱绑定验证码并把邮箱写入当前账号",
)
async def verify_email_binding_challenge(
    login_challenge_id: int,
    request: VerifyEmailBindingChallengeRequest,
    access_token: Annotated[str, Depends(get_current_agent_access_token)],
    use_case: Annotated[
        VerifyEmailBindingChallengeUseCase,
        Depends(get_verify_email_binding_challenge_use_case),
    ],
) -> ApiResponse[VerifyEmailBindingChallengeResponse]:
    result = await use_case.execute(
        request.to_command(
            access_token=access_token,
            login_challenge_id=login_challenge_id,
        )
    )
    return success_response(data=VerifyEmailBindingChallengeResponse.from_result(result))


@router.patch(
    "/me/username",
    response_model=ApiResponse[ChangeAgentUsernameResponse],
    summary="修改当前账号的用户名",
)
async def change_agent_username(
    request: ChangeAgentUsernameRequest,
    access_token: Annotated[str, Depends(get_current_agent_access_token)],
    use_case: Annotated[
        ChangeAgentUsernameUseCase,
        Depends(get_change_agent_username_use_case),
    ],
) -> ApiResponse[ChangeAgentUsernameResponse]:
    result = await use_case.execute(request.to_command(access_token=access_token))
    return success_response(data=ChangeAgentUsernameResponse.from_result(result))


@router.post(
    "/wechat-official/login-sessions",
    response_model=ApiResponse[AgentWechatLoginSessionResponse],
    summary="Create one official-account QR login session",
)
async def create_wechat_login_session(
    use_case: Annotated[
        CreateAgentWechatLoginSessionUseCase,
        Depends(get_create_wechat_login_session_use_case),
    ],
) -> ApiResponse[AgentWechatLoginSessionResponse]:
    result = await use_case.execute(CreateAgentWechatLoginSessionCommand())
    return success_response(data=AgentWechatLoginSessionResponse.from_result(result))


@router.get(
    "/wechat-official/login-sessions/{login_session_id}",
    response_model=ApiResponse[AgentWechatLoginSessionStatusResponse],
    summary="Get one official-account QR login session status",
)
async def get_wechat_login_session(
    login_session_id: int,
    use_case: Annotated[
        GetAgentWechatLoginSessionUseCase,
        Depends(get_get_wechat_login_session_use_case),
    ],
) -> ApiResponse[AgentWechatLoginSessionStatusResponse]:
    result = await use_case.execute(
        GetAgentWechatLoginSessionQuery(login_session_id=login_session_id)
    )
    return success_response(data=AgentWechatLoginSessionStatusResponse.from_result(result))


@router.post(
    "/wechat-official/login-sessions/{login_session_id}/exchange",
    response_model=ApiResponse[AgentAuthenticationResponse],
    summary="Exchange one authenticated QR login session",
)
async def exchange_wechat_login_session(
    login_session_id: int,
    request: ExchangeAgentWechatLoginRequest,
    use_case: Annotated[
        ExchangeAgentWechatLoginUseCase,
        Depends(get_exchange_wechat_login_use_case),
    ],
) -> ApiResponse[AgentAuthenticationResponse]:
    result = await use_case.execute(request.to_command(login_session_id=login_session_id))
    return success_response(data=AgentAuthenticationResponse.from_result(result))


@router.post(
    "/dev/fake-login",
    response_model=ApiResponse[AgentAuthenticationResponse],
    summary="[dev-only] Bypass WeChat scan and issue tokens for a fixed username",
    description=(
        "本地联调专用：跳过微信扫码 + 公众平台回调，按 username find-or-create 一个账号后直接签发 token。"
        "生产环境 (env=production) 会返回 404 拒绝调用。"
    ),
)
async def dev_fake_login(
    request: DevFakeLoginRequest,
    settings: Annotated[Settings, Depends(get_settings_dependency)],
    use_case: Annotated[
        DevFakeLoginUseCase,
        Depends(get_dev_fake_login_use_case),
    ],
) -> ApiResponse[AgentAuthenticationResponse]:
    # 双保险：env=production 直接 404，避免生产环境意外暴露
    if settings.env == "production":
        raise HTTPException(status_code=404, detail="Not Found")
    result = await use_case.execute(request.to_command())
    return success_response(data=AgentAuthenticationResponse.from_result(result))


@router.get(
    "/wechat-official/callback",
    summary="Handle official-account callback verification",
)
async def verify_wechat_callback(
    signature: str | None = Query(default=None),
    timestamp: str | None = Query(default=None),
    nonce: str | None = Query(default=None),
    echostr: str | None = Query(default=None),
    gateway: Annotated[
        WechatOfficialAccountGateway,
        Depends(get_official_wechat_gateway),
    ] = None,
) -> Response:
    if gateway is None:
        return Response(content="", media_type="text/plain")
    valid = gateway.verify_callback_signature(
        signature=signature,
        timestamp=timestamp,
        nonce=nonce,
    )
    return Response(content=echostr if valid and echostr is not None else "", media_type="text/plain")


@router.post(
    "/wechat-official/callback",
    summary="Handle official-account login callback events",
)
async def handle_wechat_callback(
    request: Request,
    use_case: Annotated[
        HandleAgentWechatCallbackUseCase,
        Depends(get_handle_wechat_callback_use_case),
    ],
    signature: str | None = Query(default=None),
    msg_signature: str | None = Query(default=None),
    timestamp: str | None = Query(default=None),
    nonce: str | None = Query(default=None),
) -> Response:
    body = (await request.body()).decode("utf-8")
    await use_case.execute(
        HandleAgentWechatCallbackCommand(
            signature=signature,
            msg_signature=msg_signature,
            timestamp=timestamp,
            nonce=nonce,
            xml_body=body,
        )
    )
    return Response(content="success", media_type="text/plain")
