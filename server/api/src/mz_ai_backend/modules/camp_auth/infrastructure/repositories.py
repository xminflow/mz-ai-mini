from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..application import (
    CampAccountRegistration,
    CampMembershipSummary,
    CampSessionIssue,
    CampWechatIdentityUpsert,
    CampWechatLoginGrantIssue,
    CampWechatLoginSessionCreate,
)
from ..domain import (
    CampAccessTokenRecord,
    CampAccount,
    CampAccountStatus,
    CampAuthSession,
    CampWechatIdentity,
    CampWechatLoginSession,
    CampWechatLoginSessionStatus,
    CampWechatSubscribeStatus,
)
from .models import (
    CampAccountModel,
    CampAuthAccessTokenModel,
    CampAuthSessionModel,
    CampWechatIdentityModel,
    CampWechatLoginSessionModel,
)


def _to_camp_account(model: CampAccountModel) -> CampAccount:
    """将 ORM model 映射为领域实体；包含 enrollment 字段，不含 password 字段。"""
    return CampAccount(
        account_id=model.account_id,
        username=model.username,
        email=model.email,
        status=CampAccountStatus(model.status),
        enrollment_status=model.enrollment_status,
        enrolled_at=model.enrolled_at,
        enrollment_expires_at=model.enrollment_expires_at,
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_session(model: CampAuthSessionModel) -> CampAuthSession:
    return CampAuthSession(
        session_id=model.session_id,
        account_id=model.account_id,
        refresh_token_hash=model.refresh_token_hash,
        expires_at=model.expires_at,
        revoked_at=model.revoked_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_access_token(model: CampAuthAccessTokenModel) -> CampAccessTokenRecord:
    return CampAccessTokenRecord(
        token_id=model.token_id,
        session_id=model.session_id,
        access_token_hash=model.access_token_hash,
        expires_at=model.expires_at,
        created_at=model.created_at,
    )


def _to_wechat_identity(model: CampWechatIdentityModel) -> CampWechatIdentity:
    return CampWechatIdentity(
        identity_id=model.identity_id,
        account_id=model.account_id,
        official_openid=model.official_openid,
        subscribe_status=CampWechatSubscribeStatus(model.subscribe_status),
        subscribed_at=model.subscribed_at,
        unsubscribed_at=model.unsubscribed_at,
        last_event_at=model.last_event_at,
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_wechat_login_session(model: CampWechatLoginSessionModel) -> CampWechatLoginSession:
    return CampWechatLoginSession(
        login_session_id=model.login_session_id,
        scene_key=model.scene_key,
        status=CampWechatLoginSessionStatus(model.status),
        official_openid=model.official_openid,
        account_id=model.account_id,
        login_grant_token_hash=model.login_grant_token_hash,
        expires_at=model.expires_at,
        authenticated_at=model.authenticated_at,
        consumed_at=model.consumed_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_naive_utc(value: datetime | None) -> datetime | None:
    """将带时区的 datetime 转为 UTC naive；None 或已是 naive 则原值返回。"""
    if value is None or value.tzinfo is None:
        return value
    return value.astimezone(UTC).replace(tzinfo=None)


class SqlAlchemyCampAccountRepository:
    """SQLAlchemy-backed repository for aicamp authentication."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def get_account_by_username(self, username: str) -> CampAccount | None:
        result = await self._session.execute(
            select(CampAccountModel).where(
                CampAccountModel.username == username,
                CampAccountModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_camp_account(model)

    async def get_account_by_id(self, account_id: int) -> CampAccount | None:
        result = await self._session.execute(
            select(CampAccountModel).where(
                CampAccountModel.account_id == account_id,
                CampAccountModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_camp_account(model)

    async def create_account(self, registration: CampAccountRegistration) -> CampAccount:
        # enrollment_status 默认值由 ORM model 提供（"none"），不在注册 DTO 中传入
        model = CampAccountModel(
            account_id=registration.account_id,
            username=registration.username,
            email=registration.email,
            status=registration.status.value,
            is_deleted=False,
        )
        self._session.add(model)
        try:
            await self._session.commit()
        except IntegrityError as exc:
            await self._session.rollback()
            # camp 模块无独立 UsernameTakenException；以 IntegrityError 原样向上传播
            raise exc
        await self._session.refresh(model)
        return _to_camp_account(model)

    async def create_session(self, issue: CampSessionIssue) -> None:
        self._session.add(
            CampAuthSessionModel(
                session_id=issue.session_id,
                account_id=issue.account_id,
                refresh_token_hash=issue.refresh_token_hash,
                expires_at=_to_naive_utc(issue.refresh_token_expires_at),
            )
        )
        self._session.add(
            CampAuthAccessTokenModel(
                token_id=issue.access_token_id,
                session_id=issue.session_id,
                access_token_hash=issue.access_token_hash,
                expires_at=_to_naive_utc(issue.access_token_expires_at),
            )
        )
        await self._session.commit()

    async def get_session_by_refresh_token_hash(
        self,
        refresh_token_hash: str,
    ) -> CampAuthSession | None:
        result = await self._session.execute(
            select(CampAuthSessionModel).where(
                CampAuthSessionModel.refresh_token_hash == refresh_token_hash
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_session(model)

    async def get_session_by_id(self, session_id: int) -> CampAuthSession | None:
        result = await self._session.execute(
            select(CampAuthSessionModel).where(CampAuthSessionModel.session_id == session_id)
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_session(model)

    async def get_access_token_record(
        self,
        access_token_hash: str,
    ) -> CampAccessTokenRecord | None:
        result = await self._session.execute(
            select(CampAuthAccessTokenModel).where(
                CampAuthAccessTokenModel.access_token_hash == access_token_hash
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_access_token(model)

    async def revoke_session(self, session_id: int) -> bool:
        model = await self._load_session(session_id=session_id)
        if model is None or model.revoked_at is not None:
            return False
        model.revoked_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        return True

    async def revoke_session_by_refresh_token_hash(self, refresh_token_hash: str) -> bool:
        result = await self._session.execute(
            select(CampAuthSessionModel).where(
                CampAuthSessionModel.refresh_token_hash == refresh_token_hash
            )
        )
        model = result.scalar_one_or_none()
        if model is None or model.revoked_at is not None:
            return False
        model.revoked_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        return True

    async def replace_session_tokens(
        self,
        *,
        session_id: int,
        refresh_token_hash: str,
        refresh_token_expires_at,
        access_token_id: int,
        access_token_hash: str,
        access_token_expires_at,
    ) -> None:
        model = await self._load_session(session_id=session_id)
        if model is None:
            return
        model.refresh_token_hash = refresh_token_hash
        model.expires_at = _to_naive_utc(refresh_token_expires_at)
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.execute(
            delete(CampAuthAccessTokenModel).where(
                CampAuthAccessTokenModel.session_id == session_id
            )
        )
        self._session.add(
            CampAuthAccessTokenModel(
                token_id=access_token_id,
                session_id=session_id,
                access_token_hash=access_token_hash,
                expires_at=_to_naive_utc(access_token_expires_at),
            )
        )
        await self._session.commit()

    async def get_wechat_identity_by_openid(
        self,
        official_openid: str,
    ) -> CampWechatIdentity | None:
        result = await self._session.execute(
            select(CampWechatIdentityModel).where(
                CampWechatIdentityModel.official_openid == official_openid,
                CampWechatIdentityModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_wechat_identity(model)

    async def create_wechat_identity(
        self,
        registration: CampWechatIdentityUpsert,
    ) -> CampWechatIdentity:
        model = CampWechatIdentityModel(
            identity_id=registration.identity_id,
            account_id=registration.account_id,
            official_openid=registration.official_openid,
            subscribe_status=registration.subscribe_status.value,
            subscribed_at=_to_naive_utc(registration.subscribed_at),
            unsubscribed_at=_to_naive_utc(registration.unsubscribed_at),
            last_event_at=_to_naive_utc(registration.last_event_at),
            is_deleted=False,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_identity(model)

    async def update_wechat_identity(
        self,
        registration: CampWechatIdentityUpsert,
    ) -> CampWechatIdentity:
        result = await self._session.execute(
            select(CampWechatIdentityModel).where(
                CampWechatIdentityModel.identity_id == registration.identity_id
            )
        )
        model = result.scalar_one()
        model.account_id = registration.account_id
        model.subscribe_status = registration.subscribe_status.value
        model.subscribed_at = _to_naive_utc(registration.subscribed_at)
        model.unsubscribed_at = _to_naive_utc(registration.unsubscribed_at)
        model.last_event_at = _to_naive_utc(registration.last_event_at)
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_identity(model)

    async def create_wechat_login_session(
        self,
        create: CampWechatLoginSessionCreate,
    ) -> CampWechatLoginSession:
        model = CampWechatLoginSessionModel(
            login_session_id=create.login_session_id,
            scene_key=create.scene_key,
            status=create.status.value,
            expires_at=_to_naive_utc(create.expires_at),
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_login_session(model)

    async def get_wechat_login_session_by_id(
        self,
        login_session_id: int,
    ) -> CampWechatLoginSession | None:
        result = await self._session.execute(
            select(CampWechatLoginSessionModel).where(
                CampWechatLoginSessionModel.login_session_id == login_session_id
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_wechat_login_session(model)

    async def get_wechat_login_session_by_scene_key(
        self,
        scene_key: str,
    ) -> CampWechatLoginSession | None:
        result = await self._session.execute(
            select(CampWechatLoginSessionModel).where(
                CampWechatLoginSessionModel.scene_key == scene_key
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_wechat_login_session(model)

    async def mark_wechat_login_session_authenticated(
        self,
        *,
        login_session_id: int,
        official_openid: str,
        account_id: int,
        issue: CampWechatLoginGrantIssue,
    ) -> CampWechatLoginSession | None:
        model = await self._load_wechat_login_session(login_session_id=login_session_id)
        if model is None:
            return None
        model.status = CampWechatLoginSessionStatus.AUTHENTICATED.value
        model.official_openid = official_openid
        model.account_id = account_id
        model.authenticated_at = _to_naive_utc(issue.authenticated_at)
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_login_session(model)

    async def mark_wechat_login_session_expired(
        self,
        *,
        login_session_id: int,
    ) -> CampWechatLoginSession | None:
        model = await self._load_wechat_login_session(login_session_id=login_session_id)
        if model is None:
            return None
        model.status = CampWechatLoginSessionStatus.EXPIRED.value
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_login_session(model)

    async def mark_wechat_login_session_consumed(
        self,
        *,
        login_session_id: int,
    ) -> CampWechatLoginSession | None:
        model = await self._load_wechat_login_session(login_session_id=login_session_id)
        if model is None:
            return None
        model.status = CampWechatLoginSessionStatus.CONSUMED.value
        model.consumed_at = datetime.now(UTC).replace(tzinfo=None)
        model.updated_at = model.consumed_at
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_login_session(model)

    async def _load_session(self, *, session_id: int) -> CampAuthSessionModel | None:
        result = await self._session.execute(
            select(CampAuthSessionModel).where(CampAuthSessionModel.session_id == session_id)
        )
        return result.scalar_one_or_none()

    async def _load_wechat_login_session(
        self,
        *,
        login_session_id: int,
    ) -> CampWechatLoginSessionModel | None:
        result = await self._session.execute(
            select(CampWechatLoginSessionModel).where(
                CampWechatLoginSessionModel.login_session_id == login_session_id
            )
        )
        return result.scalar_one_or_none()

    async def get_membership_summary(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> CampMembershipSummary:
        result = await self._session.execute(
            select(CampAccountModel).where(
                CampAccountModel.account_id == account_id,
                CampAccountModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            # 账号缺失时返回 none 摘要而非抛错：/me 已通过 token 校验，仅会员信息缺省。
            return CampMembershipSummary(tier="none", is_active=False, expires_at=None, remaining_days=0)
        tier = model.membership_tier or "none"
        expires_at = model.membership_expires_at
        is_active = tier != "none" and expires_at is not None and expires_at > now
        remaining_days = 0 if expires_at is None or expires_at <= now else max(0, (expires_at - now).days)
        return CampMembershipSummary(
            tier=tier,
            is_active=is_active,
            expires_at=expires_at,
            remaining_days=remaining_days,
        )
