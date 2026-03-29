from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import (
    CreateMembershipOrderUseCase,
    GetMembershipOrderUseCase,
    GetMembershipOrderQuery,
    HandleWechatPayNotifyCommand,
    HandleWechatPayNotifyUseCase,
    MiniProgramIdentity,
)
from ..infrastructure import (
    get_create_membership_order_use_case,
    get_current_mini_program_identity,
    get_get_membership_order_use_case,
    get_handle_wechat_pay_notify_use_case,
)
from .schemas import (
    CreateMembershipOrderRequest,
    CreateMembershipOrderResponse,
    GetMembershipOrderResponse,
    WechatPayNotifyAcknowledgeResponse,
)


router = APIRouter()
mini_program_router = APIRouter(
    prefix="/memberships/wechat-mini-program",
    tags=["memberships"],
)
wechat_pay_router = APIRouter(
    prefix="/memberships/wechat-pay",
    tags=["memberships-wechat-pay"],
)


@mini_program_router.post(
    "/orders",
    response_model=ApiResponse[CreateMembershipOrderResponse],
    summary="Create one membership order",
)
async def create_membership_order(
    request: CreateMembershipOrderRequest,
    identity: Annotated[
        MiniProgramIdentity,
        Depends(get_current_mini_program_identity),
    ],
    use_case: Annotated[
        CreateMembershipOrderUseCase,
        Depends(get_create_membership_order_use_case),
    ],
) -> ApiResponse[CreateMembershipOrderResponse]:
    """Create one membership order and return mini program payment params."""

    result = await use_case.execute(request.to_command(identity=identity))
    return success_response(data=CreateMembershipOrderResponse.from_result(result))


@mini_program_router.get(
    "/orders/{order_no}",
    response_model=ApiResponse[GetMembershipOrderResponse],
    summary="Get one membership order",
)
async def get_membership_order(
    order_no: str,
    identity: Annotated[
        MiniProgramIdentity,
        Depends(get_current_mini_program_identity),
    ],
    use_case: Annotated[
        GetMembershipOrderUseCase,
        Depends(get_get_membership_order_use_case),
    ],
) -> ApiResponse[GetMembershipOrderResponse]:
    """Return one membership order for the current user."""

    result = await use_case.execute(
        GetMembershipOrderQuery(order_no=order_no, identity=identity)
    )
    return success_response(data=GetMembershipOrderResponse.from_result(result))


@wechat_pay_router.post(
    "/notify",
    response_model=WechatPayNotifyAcknowledgeResponse,
    summary="Handle one WeChat Pay callback",
)
async def handle_wechat_pay_notify(
    request: Request,
    use_case: Annotated[
        HandleWechatPayNotifyUseCase,
        Depends(get_handle_wechat_pay_notify_use_case),
    ],
) -> JSONResponse:
    """Handle one WeChat Pay callback and return WeChat protocol acknowledge."""

    body = await request.body()
    headers = {key: value for key, value in request.headers.items()}
    await use_case.execute(
        HandleWechatPayNotifyCommand(
            headers=headers,
            body=body,
        )
    )
    payload = WechatPayNotifyAcknowledgeResponse(
        code="SUCCESS",
        message="success",
    )
    return JSONResponse(
        status_code=200,
        content=payload.model_dump(mode="json"),
    )


router.include_router(mini_program_router)
router.include_router(wechat_pay_router)
