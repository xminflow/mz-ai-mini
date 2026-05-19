from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.shared.wechat_pay import WechatPayNotifyInvalidException

from ..application import (
    CreateMembershipOrderUseCase,
    GetMyMembershipQuery,
    GetMyMembershipUseCase,
    GetOrderStatusQuery,
    GetOrderStatusUseCase,
    HandleWechatPayNotifyCommand,
    HandleWechatPayNotifyUseCase,
)
from ..infrastructure import (
    get_create_membership_order_use_case,
    get_current_account_id,
    get_get_my_membership_use_case,
    get_get_order_status_use_case,
    get_handle_wechat_pay_notify_use_case,
)
from .schemas import (
    CreateMembershipOrderRequest,
    CreateMembershipOrderResponse,
    MembershipOrderStatusResponse,
    MyMembershipResponse,
    WechatPayNotifyAcknowledgeResponse,
)


router = APIRouter(prefix="/account-membership", tags=["account-membership"])


@router.post(
    "/orders",
    response_model=ApiResponse[CreateMembershipOrderResponse],
    summary="Create one website membership order",
)
async def create_membership_order(
    request: CreateMembershipOrderRequest,
    account_id: Annotated[int, Depends(get_current_account_id)],
    use_case: Annotated[
        CreateMembershipOrderUseCase,
        Depends(get_create_membership_order_use_case),
    ],
) -> ApiResponse[CreateMembershipOrderResponse]:
    """Create one Native QR membership order for the current website account."""

    result = await use_case.execute(request.to_command(account_id=account_id))
    return success_response(data=CreateMembershipOrderResponse.from_result(result))


@router.get(
    "/orders/{order_no}",
    response_model=ApiResponse[MembershipOrderStatusResponse],
    summary="Get one website membership order",
)
async def get_membership_order(
    order_no: str,
    account_id: Annotated[int, Depends(get_current_account_id)],
    use_case: Annotated[GetOrderStatusUseCase, Depends(get_get_order_status_use_case)],
) -> ApiResponse[MembershipOrderStatusResponse]:
    """Return one order status for the current website account."""

    result = await use_case.execute(GetOrderStatusQuery(account_id=account_id, order_no=order_no))
    return success_response(data=MembershipOrderStatusResponse.from_result(result))


@router.get(
    "/me",
    response_model=ApiResponse[MyMembershipResponse],
    summary="Get current website account membership",
)
async def get_my_membership(
    account_id: Annotated[int, Depends(get_current_account_id)],
    use_case: Annotated[GetMyMembershipUseCase, Depends(get_get_my_membership_use_case)],
) -> ApiResponse[MyMembershipResponse]:
    """Return the current account membership snapshot."""

    result = await use_case.execute(GetMyMembershipQuery(account_id=account_id))
    return success_response(data=MyMembershipResponse.from_result(result))


@router.post(
    "/wechat-pay/notify",
    response_model=WechatPayNotifyAcknowledgeResponse,
    summary="Handle one website WeChat Pay callback",
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
    try:
        await use_case.execute(HandleWechatPayNotifyCommand(headers=headers, body=body))
    except WechatPayNotifyInvalidException as exc:
        return JSONResponse(
            status_code=400,
            content={"code": "FAIL", "message": exc.message},
        )
    payload = WechatPayNotifyAcknowledgeResponse(code="SUCCESS", message="success")
    return JSONResponse(status_code=200, content=payload.model_dump(mode="json"))
