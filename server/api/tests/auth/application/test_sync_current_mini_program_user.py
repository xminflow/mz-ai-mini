from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.auth.application import (
    EnsureCurrentMiniProgramUserCommand,
    EnsureCurrentMiniProgramUserUseCase,
    MiniProgramIdentity,
    UserRegistration,
)
from mz_ai_backend.modules.auth.domain import (
    User,
    UserAlreadyExistsException,
    UserDisabledException,
    UserStatus,
)


class InMemoryUserRepository:
    def __init__(self, *, existing_users: dict[str, User] | None = None) -> None:
        self._users = dict(existing_users or {})
        self.created_registrations: list[UserRegistration] = []
        self.raise_on_create = False

    async def get_by_openid(self, openid: str) -> User | None:
        return self._users.get(openid)

    async def create(self, registration: UserRegistration) -> User:
        if self.raise_on_create:
            self.raise_on_create = False
            raise UserAlreadyExistsException()

        now = datetime.now(UTC)
        user = User(
            user_id=registration.user_id,
            openid=registration.openid,
            union_id=registration.union_id,
            nickname=registration.nickname,
            avatar_url=registration.avatar_url,
            status=registration.status,
            is_deleted=False,
            created_at=now,
            updated_at=now,
        )
        self._users[user.openid] = user
        self.created_registrations.append(registration)
        return user


class StubSnowflakeGenerator:
    def __init__(self, generated_id: int = 10001) -> None:
        self._generated_id = generated_id

    def generate(self) -> int:
        return self._generated_id


@pytest.mark.asyncio
async def test_sync_registers_new_user_when_openid_does_not_exist() -> None:
    repository = InMemoryUserRepository()
    use_case = EnsureCurrentMiniProgramUserUseCase(
        user_repository=repository,
        snowflake_id_generator=StubSnowflakeGenerator(),
    )

    result = await use_case.execute(
        EnsureCurrentMiniProgramUserCommand(
            identity=MiniProgramIdentity(
                openid="openid-new",
                union_id=None,
                app_id="wx-app-id",
            )
        )
    )

    assert result.is_new_user is True
    assert result.user.user_id == 10001
    assert result.user.openid == "openid-new"
    assert result.user.nickname is None
    assert result.user.avatar_url is None
    assert repository.created_registrations


@pytest.mark.asyncio
async def test_sync_returns_existing_user_without_re_registering() -> None:
    existing_user = User(
        user_id=20002,
        openid="openid-existing",
        union_id="union-1",
        nickname="已存在用户",
        avatar_url="https://example.com/existing.png",
        status=UserStatus.ACTIVE,
        is_deleted=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    repository = InMemoryUserRepository(existing_users={existing_user.openid: existing_user})
    use_case = EnsureCurrentMiniProgramUserUseCase(
        user_repository=repository,
        snowflake_id_generator=StubSnowflakeGenerator(generated_id=99999),
    )

    result = await use_case.execute(
        EnsureCurrentMiniProgramUserCommand(
            identity=MiniProgramIdentity(
                openid="openid-existing",
                union_id="union-1",
                app_id="wx-app-id",
            )
        )
    )

    assert result.is_new_user is False
    assert result.user.user_id == 20002
    assert result.user.nickname == "已存在用户"
    assert result.user.avatar_url == "https://example.com/existing.png"
    assert repository.created_registrations == []


@pytest.mark.asyncio
async def test_sync_rejects_disabled_users() -> None:
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
    use_case = EnsureCurrentMiniProgramUserUseCase(
        user_repository=repository,
        snowflake_id_generator=StubSnowflakeGenerator(),
    )

    with pytest.raises(UserDisabledException):
        await use_case.execute(
            EnsureCurrentMiniProgramUserCommand(
                identity=MiniProgramIdentity(
                    openid="openid-disabled",
                    union_id=None,
                    app_id="wx-app-id",
                )
            )
        )


@pytest.mark.asyncio
async def test_sync_recovers_when_parallel_registration_hits_unique_constraint() -> None:
    repository = InMemoryUserRepository()
    existing_user = User(
        user_id=40004,
        openid="openid-race",
        union_id=None,
        nickname=None,
        avatar_url=None,
        status=UserStatus.ACTIVE,
        is_deleted=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    repository.raise_on_create = True
    repository._users["openid-race"] = existing_user
    use_case = EnsureCurrentMiniProgramUserUseCase(
        user_repository=repository,
        snowflake_id_generator=StubSnowflakeGenerator(generated_id=50005),
    )

    result = await use_case.execute(
        EnsureCurrentMiniProgramUserCommand(
            identity=MiniProgramIdentity(
                openid="openid-race",
                union_id=None,
                app_id="wx-app-id",
            )
        )
    )

    assert result.is_new_user is False
    assert result.user.user_id == 40004
