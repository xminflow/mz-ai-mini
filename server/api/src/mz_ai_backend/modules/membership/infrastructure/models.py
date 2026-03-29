from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from mz_ai_backend.core.database import Base


class MembershipOrderModel(Base):
    """SQLAlchemy model for membership orders."""

    __tablename__ = "membership_orders"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(BigInteger, nullable=False, unique=True, index=True)
    order_no: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    openid: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    tier: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    amount_fen: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    prepay_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    transaction_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        unique=True,
        index=True,
    )
    trade_state: Mapped[str | None] = mapped_column(String(32), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    membership_applied: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    membership_started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )
    membership_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )
    notify_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP(6)"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP(6)"),
        server_onupdate=text("CURRENT_TIMESTAMP(6)"),
    )
