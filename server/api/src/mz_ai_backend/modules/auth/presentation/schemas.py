from __future__ import annotations

import base64
import binascii
from datetime import datetime
from pathlib import PurePosixPath

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

from ..application import (
    AuthorizedUserProfile,
    AuthenticatedUserSummary,
    EnsureCurrentMiniProgramUserResult,
    MiniProgramIdentity,
    UpdateCurrentMiniProgramUserProfileCommand,
    UpdateCurrentMiniProgramUserProfileResult,
)


def _serialize_business_id(value: int) -> str:
    return str(value)


class MembershipSummaryResponse(BaseModel):
    """HTTP membership summary returned with the authenticated user."""

    model_config = ConfigDict(frozen=True)

    tier: str
    is_active: bool
    started_at: datetime | None
    expires_at: datetime | None


class AuthenticatedUserResponse(BaseModel):
    """HTTP user summary returned after cloud identity sync."""

    model_config = ConfigDict(frozen=True)

    user_id: str
    openid: str
    union_id: str | None
    nickname: str | None
    avatar_url: str | None
    status: str
    membership: MembershipSummaryResponse

    @classmethod
    def from_summary(
        cls,
        summary: AuthenticatedUserSummary,
    ) -> "AuthenticatedUserResponse":
        payload = summary.model_dump(mode="json")
        payload["user_id"] = _serialize_business_id(summary.user_id)
        return cls.model_validate(payload)


class EnsureCurrentMiniProgramUserResponse(BaseModel):
    """HTTP response payload for syncing the current mini program user."""

    model_config = ConfigDict(frozen=True)

    is_new_user: bool
    user: AuthenticatedUserResponse

    @classmethod
    def from_result(
        cls,
        result: EnsureCurrentMiniProgramUserResult,
    ) -> "EnsureCurrentMiniProgramUserResponse":
        return cls(
            is_new_user=result.is_new_user,
            user=AuthenticatedUserResponse.from_summary(result.user),
        )


def _strip_required_text(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


class UploadCurrentMiniProgramUserAvatarRequest(BaseModel):
    """HTTP payload for uploading the current user's avatar binary."""

    model_config = ConfigDict(frozen=True)

    object_key: str
    content_type: str
    content_base64: str

    @field_validator("object_key")
    @classmethod
    def validate_object_key(cls, value: str) -> str:
        normalized = _strip_required_text(value, field_name="object_key").replace("\\", "/")
        path = PurePosixPath(normalized)
        if path.is_absolute() or ".." in path.parts:
            raise ValueError("object_key must stay within the avatars directory.")
        if path.parts[0] != "avatars":
            raise ValueError("object_key must start with avatars/.")
        return normalized

    @field_validator("content_type")
    @classmethod
    def validate_content_type(cls, value: str) -> str:
        normalized = _strip_required_text(value, field_name="content_type").lower()
        if normalized not in {"image/jpeg", "image/png", "image/webp"}:
            raise ValueError("content_type must be image/jpeg, image/png, or image/webp.")
        return normalized

    @field_validator("content_base64")
    @classmethod
    def validate_content_base64(cls, value: str) -> str:
        normalized = _strip_required_text(value, field_name="content_base64")
        try:
            base64.b64decode(normalized, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise ValueError("content_base64 must be valid base64.") from exc
        return normalized

    def decode_content(self) -> bytes:
        return base64.b64decode(self.content_base64, validate=True)


class UploadCurrentMiniProgramUserAvatarResponse(BaseModel):
    """HTTP response payload for the uploaded current user avatar."""

    model_config = ConfigDict(frozen=True)

    avatar_url: str


class UpdateCurrentMiniProgramUserProfileRequest(BaseModel):
    """HTTP payload for the current user's authorized profile."""

    model_config = ConfigDict(frozen=True)

    nickname: str | None = None
    avatar_url: str | None = None

    @field_validator("nickname")
    @classmethod
    def validate_nickname(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _strip_required_text(value, field_name="nickname")

    @field_validator("avatar_url")
    @classmethod
    def validate_avatar_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _strip_required_text(value, field_name="avatar_url")

    @model_validator(mode="after")
    def validate_has_profile_patch(self) -> "UpdateCurrentMiniProgramUserProfileRequest":
        if self.nickname is None and self.avatar_url is None:
            raise ValueError("At least one profile field must be provided.")
        return self

    def to_command(
        self,
        *,
        identity: MiniProgramIdentity,
    ) -> UpdateCurrentMiniProgramUserProfileCommand:
        return UpdateCurrentMiniProgramUserProfileCommand(
            identity=identity,
            profile=AuthorizedUserProfile(
                nickname=self.nickname,
                avatar_url=self.avatar_url,
            ),
        )


class UpdateCurrentMiniProgramUserProfileResponse(BaseModel):
    """HTTP response payload for the current user's updated profile."""

    model_config = ConfigDict(frozen=True)

    user: AuthenticatedUserResponse

    @classmethod
    def from_result(
        cls,
        result: UpdateCurrentMiniProgramUserProfileResult,
    ) -> "UpdateCurrentMiniProgramUserProfileResponse":
        return cls(user=AuthenticatedUserResponse.from_summary(result.user))
