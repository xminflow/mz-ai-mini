from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.modules.auth.infrastructure.models import UserModel
from mz_ai_backend.shared.wechat_pay import WechatPayNotification

from ..application.dtos import CaseResearchOrderRegistration, CaseResearchRequestRegistration
from ..domain import (
    CaseResearchOrder,
    CaseResearchOrderNotFoundException,
    CaseResearchOrderStatus,
    CaseResearchOrderStatusInvalidException,
    CaseResearchRequest,
    CaseResearchRequestStatus,
    CaseResearchVisibility,
)
from .models import CaseResearchOrderModel, CaseResearchRequestModel


def _to_case_research_request(model: CaseResearchRequestModel) -> CaseResearchRequest:
    return CaseResearchRequest(
        request_id=model.request_id,
        user_id=model.user_id,
        openid=model.openid,
        title=model.title,
        description=model.description,
        visibility=CaseResearchVisibility(model.visibility),
        status=CaseResearchRequestStatus(model.status),
        linked_case_id=model.linked_case_id,
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_case_research_order(model: CaseResearchOrderModel) -> CaseResearchOrder:
    return CaseResearchOrder(
        order_id=model.order_id,
        order_no=model.order_no,
        user_id=model.user_id,
        openid=model.openid,
        amount_fen=model.amount_fen,
        status=CaseResearchOrderStatus(model.status),
        prepay_id=model.prepay_id,
        transaction_id=model.transaction_id,
        trade_state=model.trade_state,
        paid_at=model.paid_at,
        request_applied=model.request_applied,
        request_id=model.request_id,
        title=model.title,
        description=model.description,
        notify_payload=model.notify_payload,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SqlAlchemyCaseResearchRepository:
    """Persist case research requests and payment orders."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def get_user_id_by_openid(self, *, openid: str) -> int | None:
        statement = select(UserModel).where(
            UserModel.openid == openid,
            UserModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        return model.user_id if model is not None else None

    async def create_request(
        self,
        registration: CaseResearchRequestRegistration,
    ) -> CaseResearchRequest:
        model = CaseResearchRequestModel(
            request_id=registration.request_id,
            user_id=registration.user_id,
            openid=registration.openid,
            title=registration.title,
            description=registration.description,
            visibility=registration.visibility.value,
            status=CaseResearchRequestStatus.PENDING_REVIEW.value,
            linked_case_id=None,
            is_deleted=False,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_case_research_request(model)

    async def create_pending_order(
        self,
        registration: CaseResearchOrderRegistration,
    ) -> CaseResearchOrder:
        model = CaseResearchOrderModel(
            order_id=registration.order_id,
            order_no=registration.order_no,
            user_id=registration.user_id,
            openid=registration.openid,
            amount_fen=registration.amount_fen,
            status=CaseResearchOrderStatus.PENDING.value,
            prepay_id=None,
            transaction_id=None,
            trade_state=None,
            paid_at=None,
            request_applied=False,
            request_id=None,
            title=registration.title,
            description=registration.description,
            notify_payload=None,
            is_deleted=False,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_case_research_order(model)

    async def update_order_prepay_id(
        self,
        *,
        order_no: str,
        prepay_id: str,
    ) -> CaseResearchOrder:
        statement = select(CaseResearchOrderModel).where(
            CaseResearchOrderModel.order_no == order_no,
            CaseResearchOrderModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            raise CaseResearchOrderNotFoundException()

        model.prepay_id = prepay_id
        await self._session.commit()
        await self._session.refresh(model)
        return _to_case_research_order(model)

    async def get_order_by_order_no_and_openid(
        self,
        *,
        order_no: str,
        openid: str,
    ) -> CaseResearchOrder | None:
        statement = select(CaseResearchOrderModel).where(
            CaseResearchOrderModel.order_no == order_no,
            CaseResearchOrderModel.openid == openid,
            CaseResearchOrderModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        return _to_case_research_order(model) if model is not None else None

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        snowflake_id: int,
    ) -> CaseResearchOrder:
        order_statement = (
            select(CaseResearchOrderModel)
            .where(
                CaseResearchOrderModel.order_no == notification.order_no,
                CaseResearchOrderModel.is_deleted.is_(False),
            )
            .with_for_update()
        )
        order_result = await self._session.execute(order_statement)
        order_model = order_result.scalar_one_or_none()
        if order_model is None:
            raise CaseResearchOrderNotFoundException()

        if CaseResearchOrderStatus(order_model.status) == CaseResearchOrderStatus.PAID:
            return _to_case_research_order(order_model)

        if order_model.amount_fen != notification.amount_fen:
            from mz_ai_backend.shared.wechat_pay import WechatPayNotifyMismatchException
            raise WechatPayNotifyMismatchException(
                message="Callback amount mismatches order amount.",
            )

        if notification.payer_openid and notification.payer_openid != order_model.openid:
            from mz_ai_backend.shared.wechat_pay import WechatPayNotifyMismatchException
            raise WechatPayNotifyMismatchException(
                message="Callback payer openid mismatches order openid.",
            )

        normalized_trade_state = notification.trade_state.strip().upper()

        order_model.trade_state = normalized_trade_state
        order_model.transaction_id = notification.transaction_id
        order_model.notify_payload = notification.raw_payload

        if normalized_trade_state == "SUCCESS":
            if CaseResearchOrderStatus(order_model.status) != CaseResearchOrderStatus.PENDING:
                raise CaseResearchOrderStatusInvalidException()

            request_model = CaseResearchRequestModel(
                request_id=snowflake_id,
                user_id=order_model.user_id,
                openid=order_model.openid,
                title=order_model.title,
                description=order_model.description,
                visibility=CaseResearchVisibility.PRIVATE.value,
                status=CaseResearchRequestStatus.PENDING_REVIEW.value,
                linked_case_id=None,
                is_deleted=False,
            )
            self._session.add(request_model)

            order_model.status = CaseResearchOrderStatus.PAID.value
            order_model.request_applied = True
            order_model.request_id = snowflake_id
            order_model.paid_at = notification.success_time
        elif normalized_trade_state in {"NOTPAY", "USERPAYING"}:
            await self._session.commit()
            await self._session.refresh(order_model)
            return _to_case_research_order(order_model)
        else:
            current_status = CaseResearchOrderStatus(order_model.status)
            if current_status == CaseResearchOrderStatus.FAILED:
                await self._session.commit()
                await self._session.refresh(order_model)
                return _to_case_research_order(order_model)
            if current_status != CaseResearchOrderStatus.PENDING:
                raise CaseResearchOrderStatusInvalidException()
            order_model.status = CaseResearchOrderStatus.FAILED.value
            order_model.request_applied = False

        await self._session.commit()
        await self._session.refresh(order_model)
        return _to_case_research_order(order_model)

    async def list_private_requests_by_openid(
        self,
        *,
        openid: str,
    ) -> list[CaseResearchRequest]:
        statement = (
            select(CaseResearchRequestModel)
            .where(
                CaseResearchRequestModel.openid == openid,
                CaseResearchRequestModel.visibility == CaseResearchVisibility.PRIVATE.value,
                CaseResearchRequestModel.is_deleted.is_(False),
            )
            .order_by(CaseResearchRequestModel.created_at.desc())
        )
        result = await self._session.execute(statement)
        models = result.scalars().all()
        return [_to_case_research_request(m) for m in models]
