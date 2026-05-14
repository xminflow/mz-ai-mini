from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..application import (
    AgentAccountRegistration,
    AgentEmailLoginChallengeCreate,
    AgentSessionIssue,
    AgentWechatIdentityUpsert,
    AgentWechatLoginGrantIssue,
    AgentWechatLoginSessionCreate,
)
from ..domain import (
    AgentAccessTokenRecord,
    AgentAccount,
    AgentAccountStatus,
    AgentAuthSession,
    AgentEmailLoginChallenge,
    AgentUsernameTakenException,
    AgentWechatIdentity,
    AgentWechatLoginSession,
    AgentWechatLoginSessionStatus,
    AgentWechatSubscribeStatus,
)
from .models import (
    AgentAccountModel,
    AgentAuthAccessTokenModel,
    AgentEmailLoginChallengeModel,
    AgentAuthSessionModel,
    AgentWechatIdentityModel,
    AgentWechatLoginSessionModel,
)


def _to_account(model: AgentAccountModel) -> AgentAccount:
    return AgentAccount(
        account_id=model.account_id,
        username=model.username,
        email=model.email,
        password_hash=model.password_hash,
        password_salt=model.password_salt,
        password_scheme_version=model.password_scheme_version,
        status=AgentAccountStatus(model.status),
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_session(model: AgentAuthSessionModel) -> AgentAuthSession:
    return AgentAuthSession(
        session_id=model.session_id,
        account_id=model.account_id,
        refresh_token_hash=model.refresh_token_hash,
        expires_at=model.expires_at,
        revoked_at=model.revoked_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_access_token(model: AgentAuthAccessTokenModel) -> AgentAccessTokenRecord:
    return AgentAccessTokenRecord(
        token_id=model.token_id,
        session_id=model.session_id,
        access_token_hash=model.access_token_hash,
        expires_at=model.expires_at,
        created_at=model.created_at,
    )


def _to_wechat_identity(model: AgentWechatIdentityModel) -> AgentWechatIdentity:
    return AgentWechatIdentity(
        identity_id=model.identity_id,
        account_id=model.account_id,
        official_openid=model.official_openid,
        subscribe_status=AgentWechatSubscribeStatus(model.subscribe_status),
        subscribed_at=model.subscribed_at,
        unsubscribed_at=model.unsubscribed_at,
        last_event_at=model.last_event_at,
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_wechat_login_session(model: AgentWechatLoginSessionModel) -> AgentWechatLoginSession:
    return AgentWechatLoginSession(
        login_session_id=model.login_session_id,
        scene_key=model.scene_key,
        status=AgentWechatLoginSessionStatus(model.status),
        official_openid=model.official_openid,
        account_id=model.account_id,
        login_grant_token_hash=model.login_grant_token_hash,
        expires_at=model.expires_at,
        authenticated_at=model.authenticated_at,
        consumed_at=model.consumed_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _to_email_login_challenge(model: AgentEmailLoginChallengeModel) -> AgentEmailLoginChallenge:
    return AgentEmailLoginChallenge(
        login_challenge_id=model.login_challenge_id,
        email=model.email,
        code_hash=model.code_hash,
        expires_at=model.expires_at,
        verified_at=model.verified_at,
        invalidated_at=model.invalidated_at,
        created_at=model.created_at,
    )


class SqlAlchemyAgentAccountRepository:
    """SQLAlchemy-backed repository for ua-agent remote authentication."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def get_account_by_username(self, username: str) -> AgentAccount | None:
        result = await self._session.execute(
            select(AgentAccountModel).where(
                AgentAccountModel.username == username,
                AgentAccountModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_account(model)

    async def get_account_by_id(self, account_id: int) -> AgentAccount | None:
        result = await self._session.execute(
            select(AgentAccountModel).where(
                AgentAccountModel.account_id == account_id,
                AgentAccountModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_account(model)

    async def get_account_by_email(self, email: str) -> AgentAccount | None:
        result = await self._session.execute(
            select(AgentAccountModel).where(
                AgentAccountModel.email == email,
                AgentAccountModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_account(model)

    async def get_wechat_identity_by_account_id(
        self,
        account_id: int,
    ) -> AgentWechatIdentity | None:
        result = await self._session.execute(
            select(AgentWechatIdentityModel).where(
                AgentWechatIdentityModel.account_id == account_id,
                AgentWechatIdentityModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_wechat_identity(model)

    async def create_account(self, registration: AgentAccountRegistration) -> AgentAccount:
        model = AgentAccountModel(
            account_id=registration.account_id,
            username=registration.username,
            email=registration.email,
            password_hash=registration.password_hash,
            password_salt=registration.password_salt,
            password_scheme_version=registration.password_scheme_version,
            status=registration.status.value,
            is_deleted=False,
        )
        self._session.add(model)
        try:
            await self._session.commit()
        except IntegrityError as exc:
            await self._session.rollback()
            raise AgentUsernameTakenException() from exc
        await self._session.refresh(model)
        return _to_account(model)

    async def create_session(self, issue: AgentSessionIssue) -> None:
        self._session.add(
            AgentAuthSessionModel(
                session_id=issue.session_id,
                account_id=issue.account_id,
                refresh_token_hash=issue.refresh_token_hash,
                expires_at=issue.refresh_token_expires_at,
            )
        )
        self._session.add(
            AgentAuthAccessTokenModel(
                token_id=issue.access_token_id,
                session_id=issue.session_id,
                access_token_hash=issue.access_token_hash,
                expires_at=issue.access_token_expires_at,
            )
        )
        await self._session.commit()

    async def get_session_by_refresh_token_hash(
        self,
        refresh_token_hash: str,
    ) -> AgentAuthSession | None:
        result = await self._session.execute(
            select(AgentAuthSessionModel).where(
                AgentAuthSessionModel.refresh_token_hash == refresh_token_hash
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_session(model)

    async def get_session_by_id(self, session_id: int) -> AgentAuthSession | None:
        result = await self._session.execute(
            select(AgentAuthSessionModel).where(AgentAuthSessionModel.session_id == session_id)
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_session(model)

    async def get_access_token_record(
        self,
        access_token_hash: str,
    ) -> AgentAccessTokenRecord | None:
        result = await self._session.execute(
            select(AgentAuthAccessTokenModel).where(
                AgentAuthAccessTokenModel.access_token_hash == access_token_hash
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
            select(AgentAuthSessionModel).where(
                AgentAuthSessionModel.refresh_token_hash == refresh_token_hash
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
        model.expires_at = refresh_token_expires_at
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.execute(
            delete(AgentAuthAccessTokenModel).where(
                AgentAuthAccessTokenModel.session_id == session_id
            )
        )
        self._session.add(
            AgentAuthAccessTokenModel(
                token_id=access_token_id,
                session_id=session_id,
                access_token_hash=access_token_hash,
                expires_at=access_token_expires_at,
            )
        )
        await self._session.commit()

    async def get_wechat_identity_by_openid(
        self,
        official_openid: str,
    ) -> AgentWechatIdentity | None:
        result = await self._session.execute(
            select(AgentWechatIdentityModel).where(
                AgentWechatIdentityModel.official_openid == official_openid,
                AgentWechatIdentityModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_wechat_identity(model)

    async def create_wechat_identity(
        self,
        registration: AgentWechatIdentityUpsert,
    ) -> AgentWechatIdentity:
        model = AgentWechatIdentityModel(
            identity_id=registration.identity_id,
            account_id=registration.account_id,
            official_openid=registration.official_openid,
            subscribe_status=registration.subscribe_status.value,
            subscribed_at=registration.subscribed_at,
            unsubscribed_at=registration.unsubscribed_at,
            last_event_at=registration.last_event_at,
            is_deleted=False,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_identity(model)

    async def update_wechat_identity(
        self,
        registration: AgentWechatIdentityUpsert,
    ) -> AgentWechatIdentity:
        result = await self._session.execute(
            select(AgentWechatIdentityModel).where(
                AgentWechatIdentityModel.identity_id == registration.identity_id
            )
        )
        model = result.scalar_one()
        model.account_id = registration.account_id
        model.subscribe_status = registration.subscribe_status.value
        model.subscribed_at = registration.subscribed_at
        model.unsubscribed_at = registration.unsubscribed_at
        model.last_event_at = registration.last_event_at
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_identity(model)

    async def create_wechat_login_session(
        self,
        create: AgentWechatLoginSessionCreate,
    ) -> AgentWechatLoginSession:
        model = AgentWechatLoginSessionModel(
            login_session_id=create.login_session_id,
            scene_key=create.scene_key,
            status=create.status.value,
            expires_at=create.expires_at,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_login_session(model)

    async def get_wechat_login_session_by_id(
        self,
        login_session_id: int,
    ) -> AgentWechatLoginSession | None:
        result = await self._session.execute(
            select(AgentWechatLoginSessionModel).where(
                AgentWechatLoginSessionModel.login_session_id == login_session_id
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_wechat_login_session(model)

    async def get_wechat_login_session_by_scene_key(
        self,
        scene_key: str,
    ) -> AgentWechatLoginSession | None:
        result = await self._session.execute(
            select(AgentWechatLoginSessionModel).where(
                AgentWechatLoginSessionModel.scene_key == scene_key
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
        issue: AgentWechatLoginGrantIssue,
    ) -> AgentWechatLoginSession | None:
        model = await self._load_wechat_login_session(login_session_id=login_session_id)
        if model is None:
            return None
        model.status = AgentWechatLoginSessionStatus.AUTHENTICATED.value
        model.official_openid = official_openid
        model.account_id = account_id
        model.authenticated_at = issue.authenticated_at
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_login_session(model)

    async def mark_wechat_login_session_expired(
        self,
        *,
        login_session_id: int,
    ) -> AgentWechatLoginSession | None:
        model = await self._load_wechat_login_session(login_session_id=login_session_id)
        if model is None:
            return None
        model.status = AgentWechatLoginSessionStatus.EXPIRED.value
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_login_session(model)

    async def mark_wechat_login_session_consumed(
        self,
        *,
        login_session_id: int,
    ) -> AgentWechatLoginSession | None:
        model = await self._load_wechat_login_session(login_session_id=login_session_id)
        if model is None:
            return None
        model.status = AgentWechatLoginSessionStatus.CONSUMED.value
        model.consumed_at = datetime.now(UTC).replace(tzinfo=None)
        model.updated_at = model.consumed_at
        await self._session.commit()
        await self._session.refresh(model)
        return _to_wechat_login_session(model)

    async def get_latest_email_login_challenge_by_email(
        self,
        email: str,
    ) -> AgentEmailLoginChallenge | None:
        result = await self._session.execute(
            select(AgentEmailLoginChallengeModel)
            .where(AgentEmailLoginChallengeModel.email == email)
            .order_by(AgentEmailLoginChallengeModel.created_at.desc())
            .limit(1)
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_email_login_challenge(model)

    async def invalidate_active_email_login_challenges_by_email(
        self,
        *,
        email: str,
    ) -> None:
        now = datetime.now(UTC).replace(tzinfo=None)
        result = await self._session.execute(
            select(AgentEmailLoginChallengeModel).where(
                AgentEmailLoginChallengeModel.email == email,
                AgentEmailLoginChallengeModel.verified_at.is_(None),
                AgentEmailLoginChallengeModel.invalidated_at.is_(None),
                AgentEmailLoginChallengeModel.expires_at > now,
            )
        )
        models = result.scalars().all()
        for model in models:
            model.invalidated_at = now
        await self._session.commit()

    async def create_email_login_challenge(
        self,
        create: AgentEmailLoginChallengeCreate,
    ) -> AgentEmailLoginChallenge:
        model = AgentEmailLoginChallengeModel(
            login_challenge_id=create.login_challenge_id,
            email=create.email,
            code_hash=create.code_hash,
            expires_at=create.expires_at,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_email_login_challenge(model)

    async def get_email_login_challenge_by_id(
        self,
        login_challenge_id: int,
    ) -> AgentEmailLoginChallenge | None:
        result = await self._session.execute(
            select(AgentEmailLoginChallengeModel).where(
                AgentEmailLoginChallengeModel.login_challenge_id == login_challenge_id
            )
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_email_login_challenge(model)

    async def mark_email_login_challenge_verified(
        self,
        *,
        login_challenge_id: int,
        verified_at: datetime,
    ) -> AgentEmailLoginChallenge | None:
        result = await self._session.execute(
            select(AgentEmailLoginChallengeModel).where(
                AgentEmailLoginChallengeModel.login_challenge_id == login_challenge_id
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        model.verified_at = verified_at
        await self._session.commit()
        await self._session.refresh(model)
        return _to_email_login_challenge(model)

    async def _load_session(self, *, session_id: int) -> AgentAuthSessionModel | None:
        result = await self._session.execute(
            select(AgentAuthSessionModel).where(AgentAuthSessionModel.session_id == session_id)
        )
        return result.scalar_one_or_none()

    async def _load_wechat_login_session(
        self,
        *,
        login_session_id: int,
    ) -> AgentWechatLoginSessionModel | None:
        result = await self._session.execute(
            select(AgentWechatLoginSessionModel).where(
                AgentWechatLoginSessionModel.login_session_id == login_session_id
            )
        )
        return result.scalar_one_or_none()
