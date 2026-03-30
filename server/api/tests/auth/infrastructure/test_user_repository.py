from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.modules.auth.application import AuthorizedUserProfile, UserRegistration
from mz_ai_backend.modules.auth.domain import (
    UserAlreadyExistsException,
    UserNotFoundException,
    UserStatus,
)
from mz_ai_backend.modules.auth.infrastructure.models import UserModel
from mz_ai_backend.modules.auth.infrastructure.repositories import SqlAlchemyUserRepository


class FakeScalarResult:
    def __init__(self, model: UserModel | None) -> None:
        self._model = model

    def scalar_one_or_none(self) -> UserModel | None:
        return self._model


@pytest.mark.asyncio
async def test_user_repository_returns_domain_user_for_openid_lookup() -> None:
    model = UserModel(
        user_id=1001,
        openid="openid-lookup",
        union_id="union-lookup",
        nickname="昵称",
        avatar_url="https://example.com/avatar.png",
        status=UserStatus.ACTIVE.value,
        is_deleted=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    session = AsyncMock(spec=AsyncSession)
    session.execute.return_value = FakeScalarResult(model)
    repository = SqlAlchemyUserRepository(session=session)

    user = await repository.get_by_openid("openid-lookup")

    assert user is not None
    assert user.user_id == 1001
    assert user.openid == "openid-lookup"
    assert user.nickname == "昵称"
    assert user.avatar_url == "https://example.com/avatar.png"
    assert user.status == UserStatus.ACTIVE


@pytest.mark.asyncio
async def test_user_repository_creates_user_and_returns_domain_entity() -> None:
    now = datetime.now(UTC)
    session = AsyncMock(spec=AsyncSession)

    async def refresh(model: UserModel) -> None:
        model.id = 1
        model.created_at = now
        model.updated_at = now

    session.refresh.side_effect = refresh
    repository = SqlAlchemyUserRepository(session=session)

    user = await repository.create(
        UserRegistration(
            user_id=2002,
            openid="openid-create",
            union_id=None,
            nickname=None,
            avatar_url=None,
            status=UserStatus.ACTIVE,
        )
    )

    session.add.assert_called_once()
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once()
    assert user.user_id == 2002
    assert user.openid == "openid-create"
    assert user.nickname is None
    assert user.avatar_url is None
    assert user.status == UserStatus.ACTIVE


@pytest.mark.asyncio
async def test_user_repository_rolls_back_on_unique_constraint_failure() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.commit.side_effect = IntegrityError("INSERT", {}, Exception("duplicate"))
    repository = SqlAlchemyUserRepository(session=session)

    with pytest.raises(UserAlreadyExistsException):
        await repository.create(
            UserRegistration(
                user_id=3003,
                openid="openid-duplicate",
                union_id=None,
                nickname=None,
                avatar_url=None,
                status=UserStatus.ACTIVE,
            )
        )

    session.rollback.assert_awaited_once()


@pytest.mark.asyncio
async def test_user_repository_updates_profile_and_returns_domain_entity() -> None:
    now = datetime.now(UTC)
    model = UserModel(
        user_id=4004,
        openid="openid-update",
        union_id="union-update",
        nickname=None,
        avatar_url=None,
        status=UserStatus.ACTIVE.value,
        is_deleted=False,
        created_at=now,
        updated_at=now,
    )
    session = AsyncMock(spec=AsyncSession)
    session.execute.return_value = FakeScalarResult(model)
    repository = SqlAlchemyUserRepository(session=session)

    user = await repository.update_profile(
        openid="openid-update",
        profile=AuthorizedUserProfile(
            nickname="妙智学员",
            avatar_url="https://example.com/avatar.png",
        ),
    )

    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(model)
    assert model.nickname == "妙智学员"
    assert model.avatar_url == "https://example.com/avatar.png"
    assert user.nickname == "妙智学员"
    assert user.avatar_url == "https://example.com/avatar.png"


@pytest.mark.asyncio
async def test_user_repository_updates_only_supplied_profile_fields() -> None:
    now = datetime.now(UTC)
    model = UserModel(
        user_id=4004,
        openid="openid-update",
        union_id="union-update",
        nickname="旧昵称",
        avatar_url="https://example.com/original.png",
        status=UserStatus.ACTIVE.value,
        is_deleted=False,
        created_at=now,
        updated_at=now,
    )
    session = AsyncMock(spec=AsyncSession)
    session.execute.return_value = FakeScalarResult(model)
    repository = SqlAlchemyUserRepository(session=session)

    user = await repository.update_profile(
        openid="openid-update",
        profile=AuthorizedUserProfile(
            nickname="新昵称",
        ),
    )

    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(model)
    assert model.nickname == "新昵称"
    assert model.avatar_url == "https://example.com/original.png"
    assert user.nickname == "新昵称"
    assert user.avatar_url == "https://example.com/original.png"


@pytest.mark.asyncio
async def test_user_repository_update_profile_rejects_missing_user() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.execute.return_value = FakeScalarResult(None)
    repository = SqlAlchemyUserRepository(session=session)

    with pytest.raises(UserNotFoundException):
        await repository.update_profile(
            openid="openid-missing",
            profile=AuthorizedUserProfile(
                nickname="妙智学员",
                avatar_url="https://example.com/avatar.png",
            ),
        )
