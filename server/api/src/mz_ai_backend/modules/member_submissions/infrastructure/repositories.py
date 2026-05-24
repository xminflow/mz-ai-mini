from __future__ import annotations

from datetime import datetime

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.exceptions import InternalServerException
from mz_ai_backend.modules.account_membership.application.ports import (
    AccountMembershipRepository,
)

from ..application.dtos import MemberSubmissionRegistration
from ..application.ports.services import MembershipStatus, MembershipStatusReader
from ..domain import (
    MemberSubmission,
    SubmissionStatus,
    SubmissionType,
)
from .models import MemberSubmissionModel


_COUNTABLE_STATUSES: tuple[str, ...] = (
    SubmissionStatus.PENDING.value,
    SubmissionStatus.PROCESSING.value,
    SubmissionStatus.DONE.value,
)


def _to_domain(model: MemberSubmissionModel) -> MemberSubmission:
    return MemberSubmission(
        submission_id=model.submission_id,
        account_id=model.account_id,
        type=SubmissionType(model.type),
        payload_text=model.payload_text,
        payload_meta=dict(model.payload_meta or {}),
        status=SubmissionStatus(model.status),
        period_key=model.period_key,
        processed_note=model.processed_note,
        processed_at=model.processed_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SqlAlchemyMemberSubmissionRepository:
    """Persist member submission tickets through SQLAlchemy."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        registration: MemberSubmissionRegistration,
    ) -> MemberSubmission:
        model = MemberSubmissionModel(
            submission_id=registration.submission_id,
            account_id=registration.account_id,
            type=registration.type.value,
            payload_text=registration.payload_text,
            payload_meta=dict(registration.payload_meta),
            status=SubmissionStatus.PENDING.value,
            period_key=registration.period_key,
            processed_note=None,
            processed_at=None,
            is_deleted=False,
            created_at=registration.created_at,
            updated_at=registration.created_at,
        )
        self._session.add(model)
        try:
            await self._session.commit()
        except IntegrityError as exc:
            await self._session.rollback()
            raise InternalServerException(
                message="Failed to persist member submission.",
            ) from exc
        await self._session.refresh(model)
        return _to_domain(model)

    async def count_consumed_in_period(
        self,
        *,
        account_id: int,
        submission_type: SubmissionType,
        period_key: str,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(MemberSubmissionModel)
            .where(
                MemberSubmissionModel.account_id == account_id,
                MemberSubmissionModel.type == submission_type.value,
                MemberSubmissionModel.period_key == period_key,
                MemberSubmissionModel.status.in_(_COUNTABLE_STATUSES),
                MemberSubmissionModel.is_deleted.is_(False),
            )
        )
        result = await self._session.execute(statement)
        return int(result.scalar_one())

    async def list_by_account(
        self,
        *,
        account_id: int,
        submission_type: SubmissionType | None,
        limit: int,
        offset: int,
    ) -> list[MemberSubmission]:
        statement = (
            select(MemberSubmissionModel)
            .where(
                MemberSubmissionModel.account_id == account_id,
                MemberSubmissionModel.is_deleted.is_(False),
            )
            .order_by(MemberSubmissionModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        if submission_type is not None:
            statement = statement.where(
                MemberSubmissionModel.type == submission_type.value,
            )
        result = await self._session.execute(statement)
        return [_to_domain(model) for model in result.scalars().all()]

    async def count_by_account(
        self,
        *,
        account_id: int,
        submission_type: SubmissionType | None,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(MemberSubmissionModel)
            .where(
                MemberSubmissionModel.account_id == account_id,
                MemberSubmissionModel.is_deleted.is_(False),
            )
        )
        if submission_type is not None:
            statement = statement.where(
                MemberSubmissionModel.type == submission_type.value,
            )
        result = await self._session.execute(statement)
        return int(result.scalar_one())

    async def find_owned_by_id(
        self,
        *,
        submission_id: int,
        account_id: int,
    ) -> MemberSubmission | None:
        # 限定 account_id：防止跨账户删除越权；过滤 is_deleted=FALSE：已删的视为不存在。
        statement = select(MemberSubmissionModel).where(
            MemberSubmissionModel.submission_id == submission_id,
            MemberSubmissionModel.account_id == account_id,
            MemberSubmissionModel.is_deleted.is_(False),
        )
        result = await self._session.execute(statement)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return _to_domain(model)

    async def mark_deleted(
        self,
        *,
        submission_id: int,
        account_id: int,
    ) -> bool:
        # 单条 UPDATE，原子性，避免 select-then-update 间隙并发删除。
        # status 限制由 use case 校验，仓库层不重复，避免业务规则散落两处。
        statement = (
            update(MemberSubmissionModel)
            .where(
                MemberSubmissionModel.submission_id == submission_id,
                MemberSubmissionModel.account_id == account_id,
                MemberSubmissionModel.is_deleted.is_(False),
            )
            .values(is_deleted=True)
        )
        result = await self._session.execute(statement)
        await self._session.commit()
        return result.rowcount > 0


class AccountMembershipStatusReader:
    """Adapt account_membership repository into a MembershipStatusReader port."""

    def __init__(
        self,
        *,
        account_membership_repository: AccountMembershipRepository,
    ) -> None:
        self._repository = account_membership_repository

    async def get_status(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> MembershipStatus:
        snapshot = await self._repository.get_membership_snapshot(
            account_id=account_id,
            now=now,
        )
        return MembershipStatus(
            account_id=snapshot.account_id,
            is_active=snapshot.is_active,
            expires_at=snapshot.expires_at,
            tier=snapshot.tier.value,
        )
