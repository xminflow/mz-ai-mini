from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from ..domain import UserStatus


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


class AuthenticatedUserSummary(BaseModel):
    """Public user summary returned after login."""

    model_config = ConfigDict(frozen=True)

    user_id: int
    openid: str
    union_id: str | None
    nickname: str | None
    avatar_url: str | None
    status: UserStatus


class EnsureCurrentMiniProgramUserResult(BaseModel):
    """Result returned after syncing the current mini program user."""

    model_config = ConfigDict(frozen=True)

    is_new_user: bool
    user: AuthenticatedUserSummary


class AuthorizedUserProfile(BaseModel):
    """Profile payload collected from explicit mini program authorization."""

    model_config = ConfigDict(frozen=True)

    nickname: str
    avatar_url: str


class UpdateCurrentMiniProgramUserProfileCommand(BaseModel):
    """Input command for syncing the current user's authorized profile."""

    model_config = ConfigDict(frozen=True)

    identity: MiniProgramIdentity
    profile: AuthorizedUserProfile


class UpdateCurrentMiniProgramUserProfileResult(BaseModel):
    """Result returned after updating the current user's profile."""

    model_config = ConfigDict(frozen=True)

    user: AuthenticatedUserSummary
