from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Identity, String, func
from sqlalchemy.orm import Mapped, mapped_column

from mz_ai_backend.core.database import Base


class CampAccountModel(Base):
    """SQLAlchemy model for aicamp accounts.

    列定义与 0029_create_camp_auth_tables.sql 保持一致。
    无密码字段，使用 enrollment_* 代替 membership_* 。
    """

    __tablename__ = "camp_accounts"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    account_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(256), unique=True, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    enrollment_status: Mapped[str] = mapped_column(String(16), nullable=False, default="none")
    enrolled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )
    enrollment_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )
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


class CampAuthSessionModel(Base):
    """SQLAlchemy model for camp refresh sessions."""

    __tablename__ = "camp_auth_sessions"

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


class CampAuthAccessTokenModel(Base):
    """SQLAlchemy model for camp access tokens."""

    __tablename__ = "camp_auth_access_tokens"

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


class CampWechatIdentityModel(Base):
    """SQLAlchemy model for camp official-account identity bindings."""

    __tablename__ = "camp_wechat_identities"

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


class CampWechatLoginSessionModel(Base):
    """SQLAlchemy model for camp QR login sessions."""

    __tablename__ = "camp_wechat_login_sessions"

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
