from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import (
    CreateCaseResearchOrderUseCase,
    CreatePublicCaseResearchRequestUseCase,
    GetCaseResearchOrderQuery,
    GetCaseResearchOrderUseCase,
    HandleWechatPayNotifyCommand,
    HandleWechatPayNotifyUseCase,
    ListUserCaseResearchRequestsQuery,
    ListUserCaseResearchRequestsUseCase,
    MiniProgramIdentity,
)
from ..infrastructure import (
    get_create_order_use_case,
    get_create_public_request_use_case,
    get_current_mini_program_identity,
    get_get_order_use_case,
    get_handle_notify_use_case,
    get_list_requests_use_case,
)
from .schemas import (
    CreateCaseResearchOrderResponse,
    CreateCaseResearchRequestPayload,
    CreateCaseResearchRequestResponse,
    GetCaseResearchOrderResponse,
    ListUserCaseResearchRequestsResponse,
    WechatPayNotifyAcknowledgeResponse,
)

router = APIRouter()
mini_program_router = APIRouter(
    prefix="/case-research/wechat-mini-program",
    tags=["case-research"],
)
wechat_pay_router = APIRouter(
    prefix="/case-research/wechat-pay",
    tags=["case-research-wechat-pay"],
)


@mini_program_router.post(
    "/requests",
    response_model=ApiResponse[CreateCaseResearchRequestResponse],
    summary="Create one public case research request",
)
async def create_public_case_research_request(
    payload: CreateCaseResearchRequestPayload,
    identity: Annotated[MiniProgramIdentity, Depends(get_current_mini_program_identity)],
    use_case: Annotated[
        CreatePublicCaseResearchRequestUseCase,
        Depends(get_create_public_request_use_case),
    ],
) -> ApiResponse[CreateCaseResearchRequestResponse]:
    """Create one public case research request for evaluation."""
    result = await use_case.execute(payload.to_public_command(identity=identity))
    return success_response(data=CreateCaseResearchRequestResponse.from_result(result))


@mini_program_router.post(
    "/orders",
    response_model=ApiResponse[CreateCaseResearchOrderResponse],
    summary="Create one private case research order",
)
async def create_case_research_order(
    payload: CreateCaseResearchRequestPayload,
    identity: Annotated[MiniProgramIdentity, Depends(get_current_mini_program_identity)],
    use_case: Annotated[
        CreateCaseResearchOrderUseCase,
        Depends(get_create_order_use_case),
    ],
) -> ApiResponse[CreateCaseResearchOrderResponse]:
    """Create one private case research payment order and return payment params."""
    result = await use_case.execute(payload.to_order_command(identity=identity))
    return success_response(data=CreateCaseResearchOrderResponse.from_result(result))


@mini_program_router.get(
    "/orders/{order_no}",
    response_model=ApiResponse[GetCaseResearchOrderResponse],
    summary="Get one case research order",
)
async def get_case_research_order(
    order_no: str,
    identity: Annotated[MiniProgramIdentity, Depends(get_current_mini_program_identity)],
    use_case: Annotated[GetCaseResearchOrderUseCase, Depends(get_get_order_use_case)],
) -> ApiResponse[GetCaseResearchOrderResponse]:
    """Return one case research order for the current user."""
    result = await use_case.execute(
        GetCaseResearchOrderQuery(order_no=order_no, identity=identity)
    )
    return success_response(data=GetCaseResearchOrderResponse.from_result(result))


@mini_program_router.get(
    "/requests",
    response_model=ApiResponse[ListUserCaseResearchRequestsResponse],
    summary="List user private case research requests",
)
async def list_user_case_research_requests(
    identity: Annotated[MiniProgramIdentity, Depends(get_current_mini_program_identity)],
    use_case: Annotated[
        ListUserCaseResearchRequestsUseCase,
        Depends(get_list_requests_use_case),
    ],
) -> ApiResponse[ListUserCaseResearchRequestsResponse]:
    """Return all private case research requests for the current user."""
    result = await use_case.execute(
        ListUserCaseResearchRequestsQuery(identity=identity)
    )
    return success_response(data=ListUserCaseResearchRequestsResponse.from_result(result))


@wechat_pay_router.post(
    "/notify",
    response_model=WechatPayNotifyAcknowledgeResponse,
    summary="Handle one WeChat Pay callback",
)
async def handle_wechat_pay_notify(
    request: Request,
    use_case: Annotated[HandleWechatPayNotifyUseCase, Depends(get_handle_notify_use_case)],
) -> JSONResponse:
    """Handle one WeChat Pay callback and return protocol acknowledge."""
    body = await request.body()
    headers = {key: value for key, value in request.headers.items()}
    await use_case.execute(HandleWechatPayNotifyCommand(headers=headers, body=body))
    payload = WechatPayNotifyAcknowledgeResponse(code="SUCCESS", message="success")
    return JSONResponse(status_code=200, content=payload.model_dump(mode="json"))


router.include_router(mini_program_router)
router.include_router(wechat_pay_router)
