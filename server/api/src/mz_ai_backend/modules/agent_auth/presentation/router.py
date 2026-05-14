from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, Response

from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import (
    CreateAgentWechatLoginSessionCommand,
    CreateAgentWechatLoginSessionUseCase,
    ExchangeAgentWechatLoginUseCase,
    GetCurrentAgentAccountQuery,
    GetCurrentAgentAccountUseCase,
    GetAgentWechatLoginSessionQuery,
    GetAgentWechatLoginSessionUseCase,
    HandleAgentWechatCallbackCommand,
    HandleAgentWechatCallbackUseCase,
    LogoutAgentSessionUseCase,
    RequestAgentEmailLoginChallengeUseCase,
    RefreshAgentSessionUseCase,
    VerifyAgentEmailLoginChallengeUseCase,
)
from ..infrastructure import (
    get_create_wechat_login_session_use_case,
    get_current_agent_access_token,
    get_exchange_wechat_login_use_case,
    get_get_current_agent_account_use_case,
    get_get_wechat_login_session_use_case,
    get_handle_wechat_callback_use_case,
    get_logout_agent_session_use_case,
    get_request_email_login_challenge_use_case,
    get_refresh_agent_session_use_case,
    get_verify_email_login_challenge_use_case,
)
from ..infrastructure.dependencies import get_official_wechat_gateway
from ..infrastructure.wechat_official import WechatOfficialAccountGateway
from .schemas import (
    AgentAuthAccountResponse,
    AgentAuthenticationResponse,
    AgentEmailLoginChallengeResponse,
    AgentWechatLoginSessionResponse,
    AgentWechatLoginSessionStatusResponse,
    ExchangeAgentWechatLoginRequest,
    LogoutAgentSessionRequest,
    LogoutAgentSessionResponse,
    RequestAgentEmailLoginChallengeRequest,
    RefreshAgentSessionRequest,
    VerifyAgentEmailLoginChallengeRequest,
)


router = APIRouter(prefix="/agent-auth", tags=["agent-auth"])


@router.post(
    "/email-login/challenges",
    response_model=ApiResponse[AgentEmailLoginChallengeResponse],
    summary="Create one email login challenge",
)
async def request_email_login_challenge(
    request: RequestAgentEmailLoginChallengeRequest,
    use_case: Annotated[
        RequestAgentEmailLoginChallengeUseCase,
        Depends(get_request_email_login_challenge_use_case),
    ],
) -> ApiResponse[AgentEmailLoginChallengeResponse]:
    result = await use_case.execute(request.to_command())
    return success_response(data=AgentEmailLoginChallengeResponse.from_result(result))


@router.post(
    "/email-login/challenges/{login_challenge_id}/verify",
    response_model=ApiResponse[AgentAuthenticationResponse],
    summary="Verify one email login challenge",
)
async def verify_email_login_challenge(
    login_challenge_id: int,
    request: VerifyAgentEmailLoginChallengeRequest,
    use_case: Annotated[
        VerifyAgentEmailLoginChallengeUseCase,
        Depends(get_verify_email_login_challenge_use_case),
    ],
) -> ApiResponse[AgentAuthenticationResponse]:
    result = await use_case.execute(request.to_command(login_challenge_id=login_challenge_id))
    return success_response(data=AgentAuthenticationResponse.from_result(result))


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
    timestamp: str | None = Query(default=None),
    nonce: str | None = Query(default=None),
) -> Response:
    body = (await request.body()).decode("utf-8")
    await use_case.execute(
        HandleAgentWechatCallbackCommand(
            signature=signature,
            timestamp=timestamp,
            nonce=nonce,
            xml_body=body,
        )
    )
    return Response(content="success", media_type="text/plain")
