from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


PRIVATE_CASE_RESEARCH_PRICE_FEN = 10


class CaseResearchVisibility(StrEnum):
    """Supported case research visibilities."""

    PUBLIC = "public"
    PRIVATE = "private"


class CaseResearchRequestStatus(StrEnum):
    """Supported case research request statuses."""

    PENDING_REVIEW = "pending_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class CaseResearchOrderStatus(StrEnum):
    """Supported case research order statuses."""

    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    CLOSED = "closed"


class CaseResearchRequest(BaseModel):
    """Case research request aggregate."""

    model_config = ConfigDict(frozen=True)

    request_id: int
    user_id: int
    openid: str
    title: str
    description: str
    visibility: CaseResearchVisibility
    status: CaseResearchRequestStatus
    linked_case_id: str | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class CaseResearchOrder(BaseModel):
    """Case research payment order aggregate."""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    user_id: int
    openid: str
    amount_fen: int
    status: CaseResearchOrderStatus
    prepay_id: str | None
    transaction_id: str | None
    trade_state: str | None
    paid_at: datetime | None
    request_applied: bool
    request_id: int | None
    title: str
    description: str
    notify_payload: str | None
    created_at: datetime
    updated_at: datetime
