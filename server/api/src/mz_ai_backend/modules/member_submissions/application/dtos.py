from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from ..domain import MemberSubmission, SubmissionQuotaSnapshot, SubmissionType


class CreateMemberSubmissionCommand(BaseModel):
    """Input command for creating one member submission ticket."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    type: SubmissionType
    payload_text: str
    payload_meta: dict[str, Any] = {}


class MemberSubmissionRegistration(BaseModel):
    """Repository payload for persisting one new submission."""

    model_config = ConfigDict(frozen=True)

    submission_id: int
    account_id: int
    type: SubmissionType
    payload_text: str
    payload_meta: dict[str, Any]
    period_key: str
    created_at: datetime


class CreateMemberSubmissionResult(BaseModel):
    """Result returned after a submission has been created."""

    model_config = ConfigDict(frozen=True)

    submission_id: int
    type: SubmissionType
    status: str
    period_key: str
    submitted_at: datetime
    quota_after: SubmissionQuotaSnapshot


class GetMyQuotaQuery(BaseModel):
    """Query for fetching the current account's quota snapshots."""

    model_config = ConfigDict(frozen=True)

    account_id: int


class MyQuotaResult(BaseModel):
    """Snapshot list of quotas keyed by submission type."""

    model_config = ConfigDict(frozen=True)

    quotas: list[SubmissionQuotaSnapshot]


class ListMySubmissionsQuery(BaseModel):
    """Query for paginating the current account's submissions."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    submission_type: SubmissionType | None = None
    limit: int = 20
    offset: int = 0


class MemberSubmissionsResult(BaseModel):
    """Paginated submission list plus current quota snapshots."""

    model_config = ConfigDict(frozen=True)

    items: list[MemberSubmission]
    total: int
    limit: int
    offset: int
    quotas: list[SubmissionQuotaSnapshot]


class DeleteMemberSubmissionCommand(BaseModel):
    """Input command for deleting one member submission owned by an account."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    submission_id: int


class DeleteMemberSubmissionResult(BaseModel):
    """Result returned after a submission has been soft-deleted."""

    model_config = ConfigDict(frozen=True)

    submission_id: int
    type: SubmissionType
    deleted: bool
