from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.shared.wechat_pay import WechatPayNotifyInvalidException

from ..application import (
    CreateCampMembershipOrderUseCase,
    GetCampOrderStatusQuery,
    GetCampOrderStatusUseCase,
    GetMyCampMembershipQuery,
    GetMyCampMembershipUseCase,
    HandleCampWechatPayNotifyCommand,
    HandleCampWechatPayNotifyUseCase,
)
from ..infrastructure import (
    get_create_camp_membership_order_use_case,
    get_current_camp_account_id,
    get_get_camp_order_status_use_case,
    get_get_my_camp_membership_use_case,
    get_handle_camp_wechat_pay_notify_use_case,
)
from .schemas import (
    CampMembershipOrderStatusResponse,
    CampWechatPayNotifyAcknowledgeResponse,
    CreateCampMembershipOrderRequest,
    CreateCampMembershipOrderResponse,
    MyCampMembershipResponse,
)


router = APIRouter(prefix="/camp-membership", tags=["camp-membership"])


@router.post(
    "/orders",
    response_model=ApiResponse[CreateCampMembershipOrderResponse],
    summary="Create one ai-camp membership order",
)
async def create_camp_membership_order(
    request: CreateCampMembershipOrderRequest,
    account_id: Annotated[int, Depends(get_current_camp_account_id)],
    use_case: Annotated[
        CreateCampMembershipOrderUseCase,
        Depends(get_create_camp_membership_order_use_case),
    ],
) -> ApiResponse[CreateCampMembershipOrderResponse]:
    """为当前 ai-camp 账号创建一笔 Native 扫码订单。"""

    result = await use_case.execute(request.to_command(account_id=account_id))
    return success_response(data=CreateCampMembershipOrderResponse.from_result(result))


@router.get(
    "/orders/{order_no}",
    response_model=ApiResponse[CampMembershipOrderStatusResponse],
    summary="Get one ai-camp membership order",
)
async def get_camp_membership_order(
    order_no: str,
    account_id: Annotated[int, Depends(get_current_camp_account_id)],
    use_case: Annotated[GetCampOrderStatusUseCase, Depends(get_get_camp_order_status_use_case)],
) -> ApiResponse[CampMembershipOrderStatusResponse]:
    """返回当前账号一笔订单的状态。"""

    result = await use_case.execute(GetCampOrderStatusQuery(account_id=account_id, order_no=order_no))
    return success_response(data=CampMembershipOrderStatusResponse.from_result(result))


@router.get(
    "/me",
    response_model=ApiResponse[MyCampMembershipResponse],
    summary="Get current ai-camp membership snapshot",
)
async def get_my_camp_membership(
    account_id: Annotated[int, Depends(get_current_camp_account_id)],
    use_case: Annotated[GetMyCampMembershipUseCase, Depends(get_get_my_camp_membership_use_case)],
) -> ApiResponse[MyCampMembershipResponse]:
    """返回当前账号会员快照。"""

    result = await use_case.execute(GetMyCampMembershipQuery(account_id=account_id))
    return success_response(data=MyCampMembershipResponse.from_result(result))


@router.post(
    "/wechat-pay/notify",
    response_model=CampWechatPayNotifyAcknowledgeResponse,
    summary="Handle one ai-camp WeChat Pay callback",
)
async def handle_camp_wechat_pay_notify(
    request: Request,
    use_case: Annotated[
        HandleCampWechatPayNotifyUseCase,
        Depends(get_handle_camp_wechat_pay_notify_use_case),
    ],
) -> JSONResponse:
    """处理一次微信支付回调并返回微信协议应答。"""

    body = await request.body()
    headers = {key: value for key, value in request.headers.items()}
    try:
        await use_case.execute(HandleCampWechatPayNotifyCommand(headers=headers, body=body))
    except WechatPayNotifyInvalidException as exc:
        return JSONResponse(status_code=400, content={"code": "FAIL", "message": exc.message})
    payload = CampWechatPayNotifyAcknowledgeResponse(code="SUCCESS", message="success")
    return JSONResponse(status_code=200, content=payload.model_dump(mode="json"))
