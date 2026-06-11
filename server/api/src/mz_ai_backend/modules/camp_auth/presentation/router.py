from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import (
    CreateCampWechatLoginSessionCommand,
    GetCurrentCampAccountQuery,
    GetCampWechatLoginSessionQuery,
)
from ..application.use_cases import (
    CreateCampWechatLoginSessionUseCase,
    ExchangeCampWechatLoginUseCase,
    GetCurrentCampAccountUseCase,
    GetCampWechatLoginSessionUseCase,
    LogoutCampSessionUseCase,
    RefreshCampSessionUseCase,
)
from ..infrastructure import (
    get_create_wechat_login_session_use_case,
    get_current_camp_access_token,
    get_exchange_wechat_login_use_case,
    get_get_current_camp_account_use_case,
    get_get_wechat_login_session_use_case,
    get_logout_camp_session_use_case,
    get_refresh_camp_session_use_case,
)
from .schemas import (
    CampAuthAccountResponse,
    CampAuthenticationResponse,
    CampWechatLoginSessionResponse,
    CampWechatLoginSessionStatusResponse,
    ExchangeCampWechatLoginRequest,
    LogoutCampSessionRequest,
    LogoutCampSessionResponse,
    RefreshCampSessionRequest,
)


router = APIRouter(prefix="/camp-auth", tags=["camp-auth"])


@router.post(
    "/refresh",
    response_model=ApiResponse[CampAuthenticationResponse],
    summary="Refresh one camp session",
)
async def refresh_camp_session(
    request: RefreshCampSessionRequest,
    use_case: Annotated[
        RefreshCampSessionUseCase,
        Depends(get_refresh_camp_session_use_case),
    ],
) -> ApiResponse[CampAuthenticationResponse]:
    result = await use_case.execute(request.to_command())
    return success_response(data=CampAuthenticationResponse.from_result(result))


@router.post(
    "/logout",
    response_model=ApiResponse[LogoutCampSessionResponse],
    summary="Revoke one camp session",
)
async def logout_camp_session(
    request: LogoutCampSessionRequest,
    use_case: Annotated[
        LogoutCampSessionUseCase,
        Depends(get_logout_camp_session_use_case),
    ],
) -> ApiResponse[LogoutCampSessionResponse]:
    result = await use_case.execute(request.to_command())
    return success_response(data=LogoutCampSessionResponse.from_result(result))


@router.get(
    "/me",
    response_model=ApiResponse[CampAuthAccountResponse],
    summary="Get the current camp account",
)
async def get_current_camp_account(
    access_token: Annotated[str, Depends(get_current_camp_access_token)],
    use_case: Annotated[
        GetCurrentCampAccountUseCase,
        Depends(get_get_current_camp_account_use_case),
    ],
) -> ApiResponse[CampAuthAccountResponse]:
    result = await use_case.execute(GetCurrentCampAccountQuery(access_token=access_token))
    return success_response(data=CampAuthAccountResponse.from_summary(result))


@router.post(
    "/wechat-official/login-sessions",
    response_model=ApiResponse[CampWechatLoginSessionResponse],
    summary="Create one official-account QR login session",
)
async def create_wechat_login_session(
    use_case: Annotated[
        CreateCampWechatLoginSessionUseCase,
        Depends(get_create_wechat_login_session_use_case),
    ],
) -> ApiResponse[CampWechatLoginSessionResponse]:
    result = await use_case.execute(CreateCampWechatLoginSessionCommand())
    return success_response(data=CampWechatLoginSessionResponse.from_result(result))


@router.get(
    "/wechat-official/login-sessions/{login_session_id}",
    response_model=ApiResponse[CampWechatLoginSessionStatusResponse],
    summary="Get one official-account QR login session status",
)
async def get_wechat_login_session(
    login_session_id: int,
    use_case: Annotated[
        GetCampWechatLoginSessionUseCase,
        Depends(get_get_wechat_login_session_use_case),
    ],
) -> ApiResponse[CampWechatLoginSessionStatusResponse]:
    result = await use_case.execute(
        GetCampWechatLoginSessionQuery(login_session_id=login_session_id)
    )
    return success_response(data=CampWechatLoginSessionStatusResponse.from_result(result))


@router.post(
    "/wechat-official/login-sessions/{login_session_id}/exchange",
    response_model=ApiResponse[CampAuthenticationResponse],
    summary="Exchange one authenticated QR login session",
)
async def exchange_wechat_login_session(
    login_session_id: int,
    request: ExchangeCampWechatLoginRequest,
    use_case: Annotated[
        ExchangeCampWechatLoginUseCase,
        Depends(get_exchange_wechat_login_use_case),
    ],
) -> ApiResponse[CampAuthenticationResponse]:
    result = await use_case.execute(request.to_command(login_session_id=login_session_id))
    return success_response(data=CampAuthenticationResponse.from_result(result))
