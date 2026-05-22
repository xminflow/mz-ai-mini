from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..application import (
    CreateMemberSubmissionCommand,
    CreateMemberSubmissionResult,
    DeleteMemberSubmissionResult,
    MemberSubmissionsResult,
    MyQuotaResult,
)
from ..domain import (
    MemberSubmission,
    SubmissionQuotaSnapshot,
    SubmissionStatus,
    SubmissionType,
)


_BLOGGER_URL_MIN_LENGTH = 8
_BLOGGER_URL_MAX_LENGTH = 512
_TRACK_KEYWORD_MIN_LENGTH = 2
_TRACK_KEYWORD_MAX_LENGTH = 30
_PAYLOAD_META_MAX_KEYS = 16


def _strip_required(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


class CreateMemberSubmissionPayload(BaseModel):
    """HTTP payload for creating one member submission."""

    model_config = ConfigDict(frozen=True)

    type: SubmissionType
    payload_text: str
    payload_meta: dict[str, Any] = Field(default_factory=dict)

    @field_validator("payload_text")
    @classmethod
    def validate_payload_text(cls, value: str) -> str:
        return _strip_required(value, field_name="payload_text")

    @field_validator("payload_meta")
    @classmethod
    def validate_payload_meta(cls, value: dict[str, Any]) -> dict[str, Any]:
        if len(value) > _PAYLOAD_META_MAX_KEYS:
            raise ValueError("payload_meta must not exceed 16 keys.")
        return value

    def to_command(self, *, account_id: int) -> CreateMemberSubmissionCommand:
        _validate_payload_for_type(self.type, self.payload_text)
        return CreateMemberSubmissionCommand(
            account_id=account_id,
            type=self.type,
            payload_text=self.payload_text,
            payload_meta=self.payload_meta,
        )


def _validate_payload_for_type(submission_type: SubmissionType, payload_text: str) -> None:
    if submission_type == SubmissionType.BLOGGER:
        if not (_BLOGGER_URL_MIN_LENGTH <= len(payload_text) <= _BLOGGER_URL_MAX_LENGTH):
            raise ValueError("payload_text length is out of range for blogger URL.")
        lower = payload_text.lower()
        if not (lower.startswith("http://") or lower.startswith("https://")):
            raise ValueError("payload_text must be a valid http(s) URL for blogger submissions.")
    elif submission_type == SubmissionType.TRACK:
        if not (_TRACK_KEYWORD_MIN_LENGTH <= len(payload_text) <= _TRACK_KEYWORD_MAX_LENGTH):
            raise ValueError("payload_text length is out of range for track keyword.")


class QuotaSnapshotResponse(BaseModel):
    """HTTP response shape for one quota snapshot."""

    model_config = ConfigDict(frozen=True)

    type: SubmissionType
    period_key: str
    period_start: datetime
    period_end: datetime
    limit: int
    consumed: int
    remaining: int

    @classmethod
    def from_snapshot(cls, snapshot: SubmissionQuotaSnapshot) -> "QuotaSnapshotResponse":
        return cls(
            type=snapshot.type,
            period_key=snapshot.period_key,
            period_start=snapshot.period_start,
            period_end=snapshot.period_end,
            limit=snapshot.limit,
            consumed=snapshot.consumed,
            remaining=snapshot.remaining,
        )


class MemberSubmissionItemResponse(BaseModel):
    """HTTP response shape for one persisted submission."""

    model_config = ConfigDict(frozen=True)

    submission_id: str
    type: SubmissionType
    payload_text: str
    payload_meta: dict[str, Any]
    status: SubmissionStatus
    period_key: str
    processed_note: str | None
    processed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, entity: MemberSubmission) -> "MemberSubmissionItemResponse":
        return cls(
            submission_id=str(entity.submission_id),
            type=entity.type,
            payload_text=entity.payload_text,
            payload_meta=entity.payload_meta,
            status=entity.status,
            period_key=entity.period_key,
            processed_note=entity.processed_note,
            processed_at=entity.processed_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )


class CreateMemberSubmissionResponse(BaseModel):
    """HTTP response payload after a submission is created."""

    model_config = ConfigDict(frozen=True)

    submission_id: str
    type: SubmissionType
    status: SubmissionStatus
    period_key: str
    submitted_at: datetime
    quota_after: QuotaSnapshotResponse

    @classmethod
    def from_result(
        cls,
        result: CreateMemberSubmissionResult,
    ) -> "CreateMemberSubmissionResponse":
        return cls(
            submission_id=str(result.submission_id),
            type=result.type,
            status=SubmissionStatus(result.status),
            period_key=result.period_key,
            submitted_at=result.submitted_at,
            quota_after=QuotaSnapshotResponse.from_snapshot(result.quota_after),
        )


class MyQuotaResponse(BaseModel):
    """HTTP response payload for current period quota snapshots."""

    model_config = ConfigDict(frozen=True)

    quotas: list[QuotaSnapshotResponse]

    @classmethod
    def from_result(cls, result: MyQuotaResult) -> "MyQuotaResponse":
        return cls(
            quotas=[QuotaSnapshotResponse.from_snapshot(s) for s in result.quotas],
        )


class DeleteMemberSubmissionResponse(BaseModel):
    """HTTP response payload after a submission has been soft-deleted."""

    model_config = ConfigDict(frozen=True)

    submission_id: str
    type: SubmissionType
    deleted: bool

    @classmethod
    def from_result(
        cls,
        result: DeleteMemberSubmissionResult,
    ) -> "DeleteMemberSubmissionResponse":
        return cls(
            submission_id=str(result.submission_id),
            type=result.type,
            deleted=result.deleted,
        )


class MyMemberSubmissionsResponse(BaseModel):
    """HTTP response payload for the paginated submissions list."""

    model_config = ConfigDict(frozen=True)

    items: list[MemberSubmissionItemResponse]
    total: int
    limit: int
    offset: int
    quotas: list[QuotaSnapshotResponse]

    @classmethod
    def from_result(
        cls,
        result: MemberSubmissionsResult,
    ) -> "MyMemberSubmissionsResponse":
        return cls(
            items=[MemberSubmissionItemResponse.from_entity(item) for item in result.items],
            total=result.total,
            limit=result.limit,
            offset=result.offset,
            quotas=[QuotaSnapshotResponse.from_snapshot(s) for s in result.quotas],
        )
