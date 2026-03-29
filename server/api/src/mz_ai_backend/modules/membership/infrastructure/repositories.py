from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.modules.auth.domain import UserNotFoundException
from mz_ai_backend.modules.auth.infrastructure.models import UserModel

from ..application.dtos import MembershipOrderRegistration, WechatPayNotification
from ..domain import (
    MembershipOrder,
    MembershipOrderNotFoundException,
    MembershipOrderStatus,
    MembershipOrderStatusInvalidException,
    MembershipTier,
    UserMembershipSnapshot,
    WechatPayNotifyMismatchException,
)
from .models import MembershipOrderModel


def _to_membership_order(model: MembershipOrderModel) -> MembershipOrder:
    return MembershipOrder(
        order_id=model.order_id,
        order_no=model.order_no,
        user_id=model.user_id,
        openid=model.openid,
        tier=MembershipTier(model.tier),
        amount_fen=model.amount_fen,
        status=MembershipOrderStatus(model.status),
        prepay_id=model.prepay_id,
        transaction_id=model.transaction_id,
        trade_state=model.trade_state,
        paid_at=model.paid_at,
        membership_applied=model.membership_applied,
        membership_started_at=model.membership_started_at,
        membership_expires_at=model.membership_expires_at,
        notify_payload=model.notify_payload,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SqlAlchemyMembershipRepository:
    """Persist membership orders and user membership snapshots."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def get_user_membership_by_openid(
        self,
        *,
        openid: str,
        now: datetime,
    ) -> UserMembershipSnapshot | None:
        statement = select(UserModel).where(
            UserModel.openid == openid,
            UserModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            return None

        tier = MembershipTier(model.membership_tier or MembershipTier.NONE.value)
        expires_at = model.membership_expires_at
        is_active = (
            tier != MembershipTier.NONE
            and expires_at is not None
            and expires_at > now
        )
        return UserMembershipSnapshot(
            user_id=model.user_id,
            openid=model.openid,
            tier=tier,
            started_at=model.membership_started_at,
            expires_at=expires_at,
            is_active=is_active,
        )

    async def create_pending_order(
        self,
        registration: MembershipOrderRegistration,
    ) -> MembershipOrder:
        model = MembershipOrderModel(
            order_id=registration.order_id,
            order_no=registration.order_no,
            user_id=registration.user_id,
            openid=registration.openid,
            tier=registration.tier.value,
            amount_fen=registration.amount_fen,
            status=MembershipOrderStatus.PENDING.value,
            prepay_id=None,
            transaction_id=None,
            trade_state=None,
            paid_at=None,
            membership_applied=False,
            membership_started_at=None,
            membership_expires_at=None,
            notify_payload=None,
            is_deleted=False,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_membership_order(model)

    async def update_order_prepay_id(
        self,
        *,
        order_no: str,
        prepay_id: str,
    ) -> MembershipOrder:
        statement = select(MembershipOrderModel).where(
            MembershipOrderModel.order_no == order_no,
            MembershipOrderModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            raise MembershipOrderNotFoundException()

        model.prepay_id = prepay_id
        await self._session.commit()
        await self._session.refresh(model)
        return _to_membership_order(model)

    async def get_order_by_order_no_and_openid(
        self,
        *,
        order_no: str,
        openid: str,
    ) -> MembershipOrder | None:
        statement = select(MembershipOrderModel).where(
            MembershipOrderModel.order_no == order_no,
            MembershipOrderModel.openid == openid,
            MembershipOrderModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return _to_membership_order(model)

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        membership_duration_days: int,
        expected_tier: MembershipTier,
    ) -> MembershipOrder:
        order_statement = (
            select(MembershipOrderModel)
            .where(
                MembershipOrderModel.order_no == notification.order_no,
                MembershipOrderModel.is_deleted.is_(False),
            )
            .with_for_update()
        )
        order_result = await self._session.execute(order_statement)
        order_model = order_result.scalar_one_or_none()
        if order_model is None:
            raise MembershipOrderNotFoundException()

        if MembershipOrderStatus(order_model.status) == MembershipOrderStatus.PAID:
            return _to_membership_order(order_model)

        if MembershipTier(order_model.tier) != expected_tier:
            raise WechatPayNotifyMismatchException(
                message="Callback membership tier mismatches order tier.",
            )

        if order_model.amount_fen != notification.amount_fen:
            raise WechatPayNotifyMismatchException(
                message="Callback amount mismatches order amount.",
            )

        if notification.payer_openid and notification.payer_openid != order_model.openid:
            raise WechatPayNotifyMismatchException(
                message="Callback payer openid mismatches order openid.",
            )

        normalized_trade_state = notification.trade_state.strip().upper()

        order_model.trade_state = normalized_trade_state
        order_model.transaction_id = notification.transaction_id
        order_model.notify_payload = notification.raw_payload

        if normalized_trade_state == "SUCCESS":
            if MembershipOrderStatus(order_model.status) != MembershipOrderStatus.PENDING:
                raise MembershipOrderStatusInvalidException()

            user_statement = (
                select(UserModel)
                .where(
                    UserModel.openid == order_model.openid,
                    UserModel.is_deleted.is_(False),
                )
                .with_for_update()
            )
            user_result = await self._session.execute(user_statement)
            user_model = user_result.scalar_one_or_none()
            if user_model is None:
                raise UserNotFoundException()

            membership_started_at = now
            membership_expires_at = now + timedelta(days=membership_duration_days)

            user_model.membership_tier = order_model.tier
            user_model.membership_started_at = membership_started_at
            user_model.membership_expires_at = membership_expires_at

            order_model.status = MembershipOrderStatus.PAID.value
            order_model.membership_applied = True
            order_model.membership_started_at = membership_started_at
            order_model.membership_expires_at = membership_expires_at
            order_model.paid_at = notification.success_time or now
        elif normalized_trade_state in {"NOTPAY", "USERPAYING"}:
            if MembershipOrderStatus(order_model.status) == MembershipOrderStatus.PENDING:
                await self._session.commit()
                await self._session.refresh(order_model)
                return _to_membership_order(order_model)
            return _to_membership_order(order_model)
        else:
            current_status = MembershipOrderStatus(order_model.status)
            if current_status == MembershipOrderStatus.FAILED:
                await self._session.commit()
                await self._session.refresh(order_model)
                return _to_membership_order(order_model)
            if current_status != MembershipOrderStatus.PENDING:
                raise MembershipOrderStatusInvalidException()
            order_model.status = MembershipOrderStatus.FAILED.value
            order_model.membership_applied = False

        await self._session.commit()
        await self._session.refresh(order_model)
        return _to_membership_order(order_model)
