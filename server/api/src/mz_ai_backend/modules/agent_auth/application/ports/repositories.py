from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ...domain import (
    AgentAccount,
    AgentAccessTokenRecord,
    AgentAuthSession,
    AgentEmailLoginChallenge,
    AgentWechatIdentity,
    AgentWechatLoginSession,
)
from ..dtos import (
    AgentAccountRegistration,
    AgentEmailLoginChallengeCreate,
    AgentSessionIssue,
    AgentWechatIdentityUpsert,
    AgentWechatLoginGrantIssue,
    AgentWechatLoginSessionCreate,
)


class AgentAccountRepository(Protocol):
    """Persistence contract for ua-agent remote authentication."""

    async def get_account_by_username(self, username: str) -> AgentAccount | None:
        """Return one account for the normalized username."""

    async def get_account_by_id(self, account_id: int) -> AgentAccount | None:
        """Return one account by business id."""

    async def get_account_by_email(self, email: str) -> AgentAccount | None:
        """Return one account by normalized email."""

    async def get_wechat_identity_by_account_id(
        self,
        account_id: int,
    ) -> AgentWechatIdentity | None:
        """Return one official account identity by account id."""

    async def create_account(self, registration: AgentAccountRegistration) -> AgentAccount:
        """Create one account and return the persisted entity."""

    async def create_session(self, issue: AgentSessionIssue) -> None:
        """Persist one refresh session plus its access token."""

    async def get_session_by_refresh_token_hash(
        self,
        refresh_token_hash: str,
    ) -> AgentAuthSession | None:
        """Return one session by refresh token hash."""

    async def get_session_by_id(self, session_id: int) -> AgentAuthSession | None:
        """Return one session by business id."""

    async def get_access_token_record(
        self,
        access_token_hash: str,
    ) -> AgentAccessTokenRecord | None:
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
    ) -> AgentWechatIdentity | None:
        """Return one official account identity by openid."""

    async def create_wechat_identity(
        self,
        registration: AgentWechatIdentityUpsert,
    ) -> AgentWechatIdentity:
        """Create one official account identity binding."""

    async def update_wechat_identity(
        self,
        registration: AgentWechatIdentityUpsert,
    ) -> AgentWechatIdentity:
        """Update one official account identity binding."""

    async def create_wechat_login_session(
        self,
        create: AgentWechatLoginSessionCreate,
    ) -> AgentWechatLoginSession:
        """Persist one QR login session."""

    async def get_wechat_login_session_by_id(
        self,
        login_session_id: int,
    ) -> AgentWechatLoginSession | None:
        """Return one QR login session by business id."""

    async def get_wechat_login_session_by_scene_key(
        self,
        scene_key: str,
    ) -> AgentWechatLoginSession | None:
        """Return one QR login session by scene key."""

    async def mark_wechat_login_session_authenticated(
        self,
        *,
        login_session_id: int,
        official_openid: str,
        account_id: int,
        issue: AgentWechatLoginGrantIssue,
    ) -> AgentWechatLoginSession | None:
        """Mark one QR login session as authenticated and persist its login grant."""

    async def mark_wechat_login_session_expired(
        self,
        *,
        login_session_id: int,
    ) -> AgentWechatLoginSession | None:
        """Mark one QR login session as expired."""

    async def mark_wechat_login_session_consumed(
        self,
        *,
        login_session_id: int,
    ) -> AgentWechatLoginSession | None:
        """Mark one QR login session as consumed."""

    async def get_latest_email_login_challenge_by_email(
        self,
        email: str,
    ) -> AgentEmailLoginChallenge | None:
        """Return the latest email login challenge for one normalized email."""

    async def invalidate_active_email_login_challenges_by_email(
        self,
        *,
        email: str,
    ) -> None:
        """Invalidate all active email login challenges for one normalized email."""

    async def create_email_login_challenge(
        self,
        create: AgentEmailLoginChallengeCreate,
    ) -> AgentEmailLoginChallenge:
        """Persist one email login challenge."""

    async def get_email_login_challenge_by_id(
        self,
        login_challenge_id: int,
    ) -> AgentEmailLoginChallenge | None:
        """Return one email login challenge by business id."""

    async def mark_email_login_challenge_verified(
        self,
        *,
        login_challenge_id: int,
        verified_at: datetime,
    ) -> AgentEmailLoginChallenge | None:
        """Mark one email login challenge as verified."""
