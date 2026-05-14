from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Identity, String, func
from sqlalchemy.orm import Mapped, mapped_column

from mz_ai_backend.core.database import Base


class AgentAccountModel(Base):
    """SQLAlchemy model for ua-agent remote accounts."""

    __tablename__ = "agent_accounts"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    account_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(256), unique=True, nullable=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(512), nullable=True)
    password_salt: Mapped[str | None] = mapped_column(String(128), nullable=True)
    password_scheme_version: Mapped[str | None] = mapped_column(String(16), nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class AgentAuthSessionModel(Base):
    """SQLAlchemy model for ua-agent refresh sessions."""

    __tablename__ = "agent_auth_sessions"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    session_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    account_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    refresh_token_hash: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class AgentAuthAccessTokenModel(Base):
    """SQLAlchemy model for ua-agent access tokens."""

    __tablename__ = "agent_auth_access_tokens"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    token_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    session_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    access_token_hash: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )


class AgentWechatIdentityModel(Base):
    """SQLAlchemy model for official-account identity bindings."""

    __tablename__ = "agent_wechat_identities"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    identity_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    account_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    official_openid: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    subscribe_status: Mapped[str] = mapped_column(String(16), nullable=False)
    subscribed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    unsubscribed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    last_event_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class AgentWechatLoginSessionModel(Base):
    """SQLAlchemy model for QR login sessions."""

    __tablename__ = "agent_wechat_login_sessions"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    login_session_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    scene_key: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    official_openid: Mapped[str | None] = mapped_column(String(64), nullable=True)
    account_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    login_grant_token_hash: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    authenticated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class AgentEmailLoginChallengeModel(Base):
    """SQLAlchemy model for email login challenges."""

    __tablename__ = "agent_email_login_challenges"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    login_challenge_id: Mapped[int] = mapped_column(
        BigInteger,
        unique=True,
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(256), nullable=False, index=True)
    code_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    invalidated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
