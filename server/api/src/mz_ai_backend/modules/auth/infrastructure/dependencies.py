from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import (
    get_async_session_dependency,
    get_settings_dependency,
)
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator

from ..application import (
    EnsureCurrentMiniProgramUserCommand,
    EnsureCurrentMiniProgramUserUseCase,
    MiniProgramIdentity,
    UpdateCurrentMiniProgramUserProfileUseCase,
)
from ..domain import CloudIdentityMissingException
from .repositories import SqlAlchemyUserRepository


def get_user_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyUserRepository:
    """Construct the auth user repository."""

    return SqlAlchemyUserRepository(session=session)


def get_current_mini_program_identity(
    openid: Annotated[str | None, Header(alias="X-WX-OPENID")] = None,
    union_id: Annotated[str | None, Header(alias="X-WX-UNIONID")] = None,
    app_id: Annotated[str | None, Header(alias="X-WX-APPID")] = None,
) -> MiniProgramIdentity:
    """Read the trusted cloud hosting identity from request headers."""

    if openid is None or openid.strip() == "":
        raise CloudIdentityMissingException()

    return MiniProgramIdentity(
        openid=openid.strip(),
        union_id=union_id.strip() if union_id else None,
        app_id=app_id.strip() if app_id else None,
    )


def get_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    """Construct the business id generator."""

    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_ensure_current_mini_program_user_use_case(
    user_repository: Annotated[SqlAlchemyUserRepository, Depends(get_user_repository)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
) -> EnsureCurrentMiniProgramUserUseCase:
    """Construct the current mini program user synchronization use case."""

    return EnsureCurrentMiniProgramUserUseCase(
        user_repository=user_repository,
        snowflake_id_generator=snowflake_id_generator,
    )


def get_update_current_mini_program_user_profile_use_case(
    user_repository: Annotated[SqlAlchemyUserRepository, Depends(get_user_repository)],
) -> UpdateCurrentMiniProgramUserProfileUseCase:
    """Construct the current mini program user profile synchronization use case."""

    return UpdateCurrentMiniProgramUserProfileUseCase(user_repository=user_repository)


def get_ensure_current_mini_program_user_command(
    identity: Annotated[MiniProgramIdentity, Depends(get_current_mini_program_identity)],
) -> EnsureCurrentMiniProgramUserCommand:
    """Construct the sync command from the trusted cloud identity."""

    return EnsureCurrentMiniProgramUserCommand(identity=identity)
