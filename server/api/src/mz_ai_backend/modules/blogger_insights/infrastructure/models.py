from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Identity,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from mz_ai_backend.core.database import Base


class BloggerInsightModel(Base):
    """博主洞察记录的 ORM 映射。"""

    __tablename__ = "blogger_insights"
    __table_args__ = (
        Index(
            "idx_blogger_insights_status_published_at",
            "status",
            "published_at",
        ),
        Index("idx_blogger_insights_platform", "platform"),
        Index("idx_blogger_insights_industry", "industry"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    slug: Mapped[str] = mapped_column(
        String(128), unique=True, nullable=False, index=True
    )
    platform: Mapped[str] = mapped_column(String(32), nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    signature: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    fans_count: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    total_works_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    industry: Mapped[str | None] = mapped_column(String(32), nullable=True)
    positioning: Mapped[str | None] = mapped_column(String(512), nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    cover_image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    report_html: Mapped[str] = mapped_column(Text, nullable=False)
    report_summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    source_run_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    captured_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False), nullable=True
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False), nullable=True
    )
    is_free: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="published")
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
