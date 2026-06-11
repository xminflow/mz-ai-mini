from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.modules.camp_auth.infrastructure.models import CampAccountModel
from mz_ai_backend.shared.wechat_pay import (
    WechatPayNotification,
    WechatPayNotifyMismatchException,
)

from ..application.dtos import CampMembershipOrderRegistration
from ..domain import (
    CAMP_MEMBERSHIP_DURATION_DAYS,
    CampMembershipOrder,
    CampMembershipOrderNotFoundException,
    CampMembershipOrderStatusInvalidException,
    CampMembershipSnapshot,
    CampMembershipSku,
    CampMembershipTier,
    CampOrderStatus,
)
from .models import CampMembershipOrderModel


def _to_order(model: CampMembershipOrderModel) -> CampMembershipOrder:
    return CampMembershipOrder(
        order_id=model.order_id,
        order_no=model.order_no,
        account_id=model.account_id,
        sku=CampMembershipSku(model.sku),
        amount_fen=model.amount_fen,
        status=CampOrderStatus(model.status),
        code_url=model.code_url,
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


def _remaining_days(*, expires_at: datetime | None, now: datetime) -> int:
    if expires_at is None or expires_at <= now:
        return 0
    return max(0, (expires_at - now).days)


class SqlAlchemyCampMembershipRepository:
    """持久化 ai-camp 会员订单与快照。"""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def create_pending_order(
        self,
        registration: CampMembershipOrderRegistration,
    ) -> CampMembershipOrder:
        model = CampMembershipOrderModel(
            order_id=registration.order_id,
            order_no=registration.order_no,
            account_id=registration.account_id,
            sku=registration.sku.value,
            amount_fen=registration.amount_fen,
            status=CampOrderStatus.PENDING.value,
            code_url=None,
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
        return _to_order(model)

    async def update_order_code_url(
        self,
        *,
        order_no: str,
        code_url: str,
    ) -> CampMembershipOrder:
        model = await self._load_order(order_no=order_no, for_update=False)
        if model is None:
            raise CampMembershipOrderNotFoundException()
        model.code_url = code_url
        await self._session.commit()
        await self._session.refresh(model)
        return _to_order(model)

    async def get_order_by_order_no(self, *, order_no: str) -> CampMembershipOrder | None:
        model = await self._load_order(order_no=order_no, for_update=False)
        return None if model is None else _to_order(model)

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        sku_tier_map: dict[CampMembershipSku, CampMembershipTier],
    ) -> CampMembershipOrder:
        # 锁订单行：PAID 直接幂等返回；金额不匹配按明确错误语义抛出，不静默吞没。
        order_model = await self._load_order(order_no=notification.order_no, for_update=True)
        if order_model is None:
            raise CampMembershipOrderNotFoundException()

        current_status = CampOrderStatus(order_model.status)
        if current_status == CampOrderStatus.PAID:
            return _to_order(order_model)
        if current_status != CampOrderStatus.PENDING:
            raise CampMembershipOrderStatusInvalidException()
        if order_model.amount_fen != notification.amount_fen:
            raise WechatPayNotifyMismatchException(message="Callback amount mismatches order amount.")

        normalized_trade_state = notification.trade_state.strip().upper()
        order_model.trade_state = normalized_trade_state
        order_model.transaction_id = notification.transaction_id
        order_model.notify_payload = notification.raw_payload

        if normalized_trade_state == "SUCCESS":
            account_model = await self._load_account(account_id=order_model.account_id, for_update=True)
            if account_model is None:
                raise CampMembershipOrderNotFoundException()

            granted_tier = sku_tier_map.get(CampMembershipSku(order_model.sku), CampMembershipTier.BASIC)
            paid_at = notification.success_time or now
            # 不升级、不续费叠加：一律从付款时刻起 365 天，覆盖写账号会员列。
            started_at = paid_at
            expires_at = paid_at + timedelta(days=CAMP_MEMBERSHIP_DURATION_DAYS)

            account_model.membership_tier = granted_tier.value
            account_model.membership_started_at = started_at
            account_model.membership_expires_at = expires_at

            order_model.status = CampOrderStatus.PAID.value
            order_model.paid_at = paid_at
            order_model.membership_applied = True
            order_model.membership_started_at = started_at
            order_model.membership_expires_at = expires_at
        elif normalized_trade_state in {"CLOSED", "REVOKED", "PAYERROR"}:
            order_model.status = CampOrderStatus.CLOSED.value

        await self._session.commit()
        await self._session.refresh(order_model)
        return _to_order(order_model)

    async def get_membership_snapshot(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> CampMembershipSnapshot:
        account_model = await self._load_account(account_id=account_id, for_update=False)
        if account_model is None:
            raise CampMembershipOrderNotFoundException()
        tier = CampMembershipTier(account_model.membership_tier or CampMembershipTier.NONE.value)
        expires_at = account_model.membership_expires_at
        # is_active = 等级非 NONE 且未过期；过期则视为有效等级回落 NONE（不改库内历史 tier）。
        is_active = tier != CampMembershipTier.NONE and expires_at is not None and expires_at > now
        return CampMembershipSnapshot(
            account_id=account_id,
            tier=tier,
            started_at=account_model.membership_started_at,
            expires_at=expires_at,
            is_active=is_active,
            remaining_days=_remaining_days(expires_at=expires_at, now=now),
        )

    async def _load_order(
        self,
        *,
        order_no: str,
        for_update: bool,
    ) -> CampMembershipOrderModel | None:
        statement = select(CampMembershipOrderModel).where(
            CampMembershipOrderModel.order_no == order_no,
            CampMembershipOrderModel.is_deleted.is_(False),
        )
        if for_update:
            statement = statement.with_for_update()
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def _load_account(
        self,
        *,
        account_id: int,
        for_update: bool,
    ) -> CampAccountModel | None:
        statement = select(CampAccountModel).where(
            CampAccountModel.account_id == account_id,
            CampAccountModel.is_deleted.is_(False),
        )
        if for_update:
            statement = statement.with_for_update()
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()
