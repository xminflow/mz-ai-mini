from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.modules.agent_auth.infrastructure.models import AgentAccountModel
from mz_ai_backend.shared.wechat_pay import (
    WechatPayNotification,
    WechatPayNotifyMismatchException,
)

from ..application.dtos import MembershipOrderRegistration
from ..domain import (
    AccountMembershipOrder,
    AccountMembershipOrderNotFoundException,
    AccountMembershipOrderStatusInvalidException,
    AccountMembershipSnapshot,
    MembershipSku,
    MembershipTier,
    OrderStatus,
    calculate_membership_period,
)
from .models import AccountMembershipOrderModel


def _to_order(model: AccountMembershipOrderModel) -> AccountMembershipOrder:
    return AccountMembershipOrder(
        order_id=model.order_id,
        order_no=model.order_no,
        account_id=model.account_id,
        sku=MembershipSku(model.sku),
        amount_fen=model.amount_fen,
        status=OrderStatus(model.status),
        code_url=model.code_url,
        transaction_id=model.transaction_id,
        trade_state=model.trade_state,
        paid_at=model.paid_at,
        membership_applied=model.membership_applied,
        membership_started_at=model.membership_started_at,
        membership_expires_at=model.membership_expires_at,
        last_wechat_query_at=model.last_wechat_query_at,
        notify_payload=model.notify_payload,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _remaining_days(*, expires_at: datetime | None, now: datetime) -> int:
    if expires_at is None or expires_at <= now:
        return 0
    return max(0, (expires_at - now).days)


class SqlAlchemyAccountMembershipRepository:
    """Persist website account membership orders and snapshots."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def create_pending_order(
        self,
        registration: MembershipOrderRegistration,
    ) -> AccountMembershipOrder:
        model = AccountMembershipOrderModel(
            order_id=registration.order_id,
            order_no=registration.order_no,
            account_id=registration.account_id,
            sku=registration.sku.value,
            amount_fen=registration.amount_fen,
            status=OrderStatus.PENDING.value,
            code_url=None,
            transaction_id=None,
            trade_state=None,
            paid_at=None,
            membership_applied=False,
            membership_started_at=None,
            membership_expires_at=None,
            last_wechat_query_at=None,
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
    ) -> AccountMembershipOrder:
        model = await self._load_order(order_no=order_no, for_update=False)
        if model is None:
            raise AccountMembershipOrderNotFoundException()
        model.code_url = code_url
        await self._session.commit()
        await self._session.refresh(model)
        return _to_order(model)

    async def get_order_by_order_no(self, *, order_no: str) -> AccountMembershipOrder | None:
        model = await self._load_order(order_no=order_no, for_update=False)
        return None if model is None else _to_order(model)

    async def mark_order_wechat_query_attempted(
        self,
        *,
        order_no: str,
        queried_at: datetime,
    ) -> None:
        model = await self._load_order(order_no=order_no, for_update=False)
        if model is None:
            return
        model.last_wechat_query_at = queried_at
        await self._session.commit()

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        expected_tier: MembershipTier,
    ) -> AccountMembershipOrder:
        order_model = await self._load_order(order_no=notification.order_no, for_update=True)
        if order_model is None:
            raise AccountMembershipOrderNotFoundException()

        current_status = OrderStatus(order_model.status)
        if current_status == OrderStatus.PAID:
            return _to_order(order_model)
        if current_status != OrderStatus.PENDING:
            raise AccountMembershipOrderStatusInvalidException()
        if order_model.amount_fen != notification.amount_fen:
            raise WechatPayNotifyMismatchException(message="Callback amount mismatches order amount.")

        normalized_trade_state = notification.trade_state.strip().upper()
        order_model.trade_state = normalized_trade_state
        order_model.transaction_id = notification.transaction_id
        order_model.notify_payload = notification.raw_payload

        if normalized_trade_state == "SUCCESS":
            account_model = await self._load_account(account_id=order_model.account_id, for_update=True)
            if account_model is None:
                raise AccountMembershipOrderNotFoundException()
            started_at, expires_at = calculate_membership_period(
                current_started_at=account_model.membership_started_at,
                current_expires_at=account_model.membership_expires_at,
                paid_at=notification.success_time or now,
                now=now,
            )
            account_model.membership_tier = expected_tier.value
            account_model.membership_started_at = started_at
            account_model.membership_expires_at = expires_at

            order_model.status = OrderStatus.PAID.value
            order_model.paid_at = notification.success_time or now
            order_model.membership_applied = True
            order_model.membership_started_at = started_at
            order_model.membership_expires_at = expires_at
        elif normalized_trade_state in {"CLOSED", "REVOKED", "PAYERROR"}:
            order_model.status = OrderStatus.CLOSED.value

        await self._session.commit()
        await self._session.refresh(order_model)
        return _to_order(order_model)

    async def get_membership_snapshot(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> AccountMembershipSnapshot:
        account_model = await self._load_account(account_id=account_id, for_update=False)
        if account_model is None:
            raise AccountMembershipOrderNotFoundException()
        tier = MembershipTier(account_model.membership_tier or MembershipTier.NONE.value)
        expires_at = account_model.membership_expires_at
        is_active = tier != MembershipTier.NONE and expires_at is not None and expires_at > now
        return AccountMembershipSnapshot(
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
    ) -> AccountMembershipOrderModel | None:
        statement = select(AccountMembershipOrderModel).where(
            AccountMembershipOrderModel.order_no == order_no,
            AccountMembershipOrderModel.is_deleted.is_(False),
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
    ) -> AgentAccountModel | None:
        statement = select(AgentAccountModel).where(
            AgentAccountModel.account_id == account_id,
            AgentAccountModel.is_deleted.is_(False),
        )
        if for_update:
            statement = statement.with_for_update()
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()
