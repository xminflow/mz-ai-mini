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
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from mz_ai_backend.core.database import Base


class TrackAnalysisModel(Base):
    """赛道分析记录的 ORM 映射。"""

    __tablename__ = "track_analyses"
    __table_args__ = (
        Index(
            "idx_track_analyses_status_published_at",
            "status",
            "published_at",
        ),
        Index("idx_track_analyses_industry", "industry"),
        Index("idx_track_analyses_stance", "stance"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    slug: Mapped[str] = mapped_column(
        String(128), unique=True, nullable=False, index=True
    )
    track_keyword: Mapped[str] = mapped_column(String(128), nullable=False)
    region: Mapped[str] = mapped_column(String(32), nullable=False)
    audience: Mapped[str] = mapped_column(String(64), nullable=False)
    industry: Mapped[str | None] = mapped_column(String(64), nullable=True)
    stance: Mapped[str | None] = mapped_column(String(32), nullable=True)
    stance_summary: Mapped[str | None] = mapped_column(String(512), nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    key_numbers: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    reports: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    report_order: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    data_sources_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
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
