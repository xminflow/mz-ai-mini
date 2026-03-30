from __future__ import annotations

from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from ..domain import UserMembershipTier, UserStatus


class MiniProgramIdentity(BaseModel):
    """Trusted mini program identity injected by cloud hosting."""

    model_config = ConfigDict(frozen=True)

    openid: str
    app_id: str | None
    union_id: str | None


class EnsureCurrentMiniProgramUserCommand(BaseModel):
    """Input command for current mini program user synchronization."""

    model_config = ConfigDict(frozen=True)

    identity: MiniProgramIdentity


class UserRegistration(BaseModel):
    """Registration payload for a newly created user."""

    model_config = ConfigDict(frozen=True)

    user_id: int
    openid: str
    union_id: str | None
    nickname: str | None = None
    avatar_url: str | None = None
    status: UserStatus
    membership_tier: UserMembershipTier = UserMembershipTier.NONE
    membership_started_at: datetime | None = None
    membership_expires_at: datetime | None = None


class UserMembershipSummary(BaseModel):
    """Public membership summary returned with the user profile."""

    model_config = ConfigDict(frozen=True)

    tier: UserMembershipTier
    is_active: bool
    started_at: datetime | None
    expires_at: datetime | None


def build_membership_summary(
    *,
    membership_tier: UserMembershipTier,
    membership_started_at: datetime | None,
    membership_expires_at: datetime | None,
) -> UserMembershipSummary:
    now = datetime.now(UTC).replace(tzinfo=None)
    is_active = (
        membership_tier != UserMembershipTier.NONE
        and membership_expires_at is not None
        and membership_expires_at > now
    )
    return UserMembershipSummary(
        tier=membership_tier,
        is_active=is_active,
        started_at=membership_started_at,
        expires_at=membership_expires_at,
    )


class AuthenticatedUserSummary(BaseModel):
    """Public user summary returned after login."""

    model_config = ConfigDict(frozen=True)

    user_id: int
    openid: str
    union_id: str | None
    nickname: str | None
    avatar_url: str | None
    status: UserStatus
    membership: UserMembershipSummary = Field(
        default_factory=lambda: UserMembershipSummary(
            tier=UserMembershipTier.NONE,
            is_active=False,
            started_at=None,
            expires_at=None,
        )
    )


class EnsureCurrentMiniProgramUserResult(BaseModel):
    """Result returned after syncing the current mini program user."""

    model_config = ConfigDict(frozen=True)

    is_new_user: bool
    user: AuthenticatedUserSummary


class AuthorizedUserProfile(BaseModel):
    """Profile payload collected from explicit mini program authorization."""

    model_config = ConfigDict(frozen=True)

    nickname: str | None = None
    avatar_url: str | None = None

    @field_validator("nickname", "avatar_url")
    @classmethod
    def validate_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if normalized == "":
            raise ValueError("Profile fields must not be blank.")
        return normalized

    @model_validator(mode="after")
    def validate_has_at_least_one_field(self) -> "AuthorizedUserProfile":
        if self.nickname is None and self.avatar_url is None:
            raise ValueError("At least one profile field must be provided.")
        return self


class UpdateCurrentMiniProgramUserProfileCommand(BaseModel):
    """Input command for syncing the current user's authorized profile."""

    model_config = ConfigDict(frozen=True)

    identity: MiniProgramIdentity
    profile: AuthorizedUserProfile


class UpdateCurrentMiniProgramUserProfileResult(BaseModel):
    """Result returned after updating the current user's profile."""

    model_config = ConfigDict(frozen=True)

    user: AuthenticatedUserSummary
