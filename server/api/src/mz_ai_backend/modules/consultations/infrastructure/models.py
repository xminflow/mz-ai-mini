from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Identity, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from mz_ai_backend.core.database import Base


class ConsultationRequestModel(Base):
    """SQLAlchemy model for consultation requests."""

    __tablename__ = "consultation_requests"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    consultation_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        unique=True,
        index=True,
    )
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    openid: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    email: Mapped[str] = mapped_column(String(256), nullable=False)
    business_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    business_type_other: Mapped[str | None] = mapped_column(String(128), nullable=True)
    business_description: Mapped[str] = mapped_column(Text, nullable=False)
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
