from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ...domain import (
    CampAccount,
    CampAccessTokenRecord,
    CampAuthSession,
    CampWechatIdentity,
    CampWechatLoginSession,
)
from ..dtos import (
    CampAccountRegistration,
    CampSessionIssue,
    CampWechatIdentityUpsert,
    CampWechatLoginGrantIssue,
    CampWechatLoginSessionCreate,
)


class CampAccountRepository(Protocol):
    """Persistence contract for camp authentication."""

    async def get_account_by_id(self, account_id: int) -> CampAccount | None:
        """Return one account by business id."""

    async def get_account_by_username(self, username: str) -> CampAccount | None:
        """Return one account for the normalized username."""

    async def create_account(self, registration: CampAccountRegistration) -> CampAccount:
        """Create one account and return the persisted entity."""

    async def create_session(self, issue: CampSessionIssue) -> None:
        """Persist one refresh session plus its access token."""

    async def get_session_by_refresh_token_hash(
        self,
        refresh_token_hash: str,
    ) -> CampAuthSession | None:
        """Return one session by refresh token hash."""

    async def get_session_by_id(self, session_id: int) -> CampAuthSession | None:
        """Return one session by business id."""

    async def get_access_token_record(
        self,
        access_token_hash: str,
    ) -> CampAccessTokenRecord | None:
        """Return one access token record by hash."""

    async def revoke_session(self, session_id: int) -> bool:
        """Revoke one session by business id."""

    async def revoke_session_by_refresh_token_hash(self, refresh_token_hash: str) -> bool:
        """Revoke one session by refresh token hash."""

    async def replace_session_tokens(
        self,
        *,
        session_id: int,
        refresh_token_hash: str,
        refresh_token_expires_at: datetime,
        access_token_id: int,
        access_token_hash: str,
        access_token_expires_at: datetime,
    ) -> None:
        """Rotate both refresh and access token state for one session."""

    async def get_wechat_identity_by_openid(
        self,
        official_openid: str,
    ) -> CampWechatIdentity | None:
        """Return one official account identity by openid."""

    async def create_wechat_identity(
        self,
        registration: CampWechatIdentityUpsert,
    ) -> CampWechatIdentity:
        """Create one official account identity binding."""

    async def update_wechat_identity(
        self,
        registration: CampWechatIdentityUpsert,
    ) -> CampWechatIdentity:
        """Update one official account identity binding."""

    async def create_wechat_login_session(
        self,
        create: CampWechatLoginSessionCreate,
    ) -> CampWechatLoginSession:
        """Persist one QR login session."""

    async def get_wechat_login_session_by_id(
        self,
        login_session_id: int,
    ) -> CampWechatLoginSession | None:
        """Return one QR login session by business id."""

    async def get_wechat_login_session_by_scene_key(
        self,
        scene_key: str,
    ) -> CampWechatLoginSession | None:
        """Return one QR login session by scene key."""

    async def mark_wechat_login_session_authenticated(
        self,
        *,
        login_session_id: int,
        official_openid: str,
        account_id: int,
        issue: CampWechatLoginGrantIssue,
    ) -> CampWechatLoginSession | None:
        """Mark one QR login session as authenticated and persist its login grant."""

    async def mark_wechat_login_session_expired(
        self,
        *,
        login_session_id: int,
    ) -> CampWechatLoginSession | None:
        """Mark one QR login session as expired."""

    async def mark_wechat_login_session_consumed(
        self,
        *,
        login_session_id: int,
    ) -> CampWechatLoginSession | None:
        """Mark one QR login session as consumed."""
