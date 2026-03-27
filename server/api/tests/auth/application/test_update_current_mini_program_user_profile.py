from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.auth.application import (
    AuthorizedUserProfile,
    MiniProgramIdentity,
    UpdateCurrentMiniProgramUserProfileCommand,
    UpdateCurrentMiniProgramUserProfileUseCase,
)
from mz_ai_backend.modules.auth.domain import (
    User,
    UserDisabledException,
    UserNotFoundException,
    UserStatus,
)


class InMemoryUserRepository:
    def __init__(self, *, existing_users: dict[str, User] | None = None) -> None:
        self._users = dict(existing_users or {})
        self.updated_profiles: list[tuple[str, AuthorizedUserProfile]] = []

    async def get_by_openid(self, openid: str) -> User | None:
        return self._users.get(openid)

    async def update_profile(self, *, openid: str, profile: AuthorizedUserProfile) -> User:
        user = self._users.get(openid)
        if user is None:
            raise UserNotFoundException()

        updated_user = user.model_copy(
            update={
                "nickname": profile.nickname,
                "avatar_url": profile.avatar_url,
                "updated_at": datetime.now(UTC),
            }
        )
        self._users[openid] = updated_user
        self.updated_profiles.append((openid, profile))
        return updated_user


@pytest.mark.asyncio
async def test_update_profile_overwrites_authorized_profile() -> None:
    existing_user = User(
        user_id=20002,
        openid="openid-existing",
        union_id="union-1",
        nickname=None,
        avatar_url=None,
        status=UserStatus.ACTIVE,
        is_deleted=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    repository = InMemoryUserRepository(existing_users={existing_user.openid: existing_user})
    use_case = UpdateCurrentMiniProgramUserProfileUseCase(user_repository=repository)

    result = await use_case.execute(
        UpdateCurrentMiniProgramUserProfileCommand(
            identity=MiniProgramIdentity(
                openid="openid-existing",
                union_id="union-1",
                app_id="wx-app-id",
            ),
            profile=AuthorizedUserProfile(
                nickname="妙智学员",
                avatar_url="https://example.com/avatar.png",
            ),
        )
    )

    assert result.user.nickname == "妙智学员"
    assert result.user.avatar_url == "https://example.com/avatar.png"
    assert repository.updated_profiles == [
        (
            "openid-existing",
            AuthorizedUserProfile(
                nickname="妙智学员",
                avatar_url="https://example.com/avatar.png",
            ),
        )
    ]


@pytest.mark.asyncio
async def test_update_profile_rejects_missing_current_user() -> None:
    repository = InMemoryUserRepository()
    use_case = UpdateCurrentMiniProgramUserProfileUseCase(user_repository=repository)

    with pytest.raises(UserNotFoundException):
        await use_case.execute(
            UpdateCurrentMiniProgramUserProfileCommand(
                identity=MiniProgramIdentity(
                    openid="openid-missing",
                    union_id=None,
                    app_id="wx-app-id",
                ),
                profile=AuthorizedUserProfile(
                    nickname="妙智学员",
                    avatar_url="https://example.com/avatar.png",
                ),
            )
        )


@pytest.mark.asyncio
async def test_update_profile_rejects_disabled_user() -> None:
    disabled_user = User(
        user_id=30003,
        openid="openid-disabled",
        union_id=None,
        nickname=None,
        avatar_url=None,
        status=UserStatus.DISABLED,
        is_deleted=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    repository = InMemoryUserRepository(existing_users={disabled_user.openid: disabled_user})
    use_case = UpdateCurrentMiniProgramUserProfileUseCase(user_repository=repository)

    with pytest.raises(UserDisabledException):
        await use_case.execute(
            UpdateCurrentMiniProgramUserProfileCommand(
                identity=MiniProgramIdentity(
                    openid="openid-disabled",
                    union_id=None,
                    app_id="wx-app-id",
                ),
                profile=AuthorizedUserProfile(
                    nickname="妙智学员",
                    avatar_url="https://example.com/avatar.png",
                ),
            )
        )
