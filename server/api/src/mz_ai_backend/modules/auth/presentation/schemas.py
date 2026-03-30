from __future__ import annotations

from datetime import datetime

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
