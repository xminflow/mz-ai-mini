from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import (
    get_async_session_dependency,
    get_settings_dependency,
)
from mz_ai_backend.modules.auth.application import MiniProgramIdentity
from mz_ai_backend.modules.auth.infrastructure import (
    SqlAlchemyUserRepository,
    get_current_mini_program_identity,
    get_user_repository,
)
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator

from ..application import CreateConsultationRequestUseCase
from .repositories import (
    AuthConsultationUserReader,
    SqlAlchemyConsultationRequestRepository,
)


class SystemCurrentTimeProvider:
    """Return current naive UTC datetime for persistence."""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def get_consultation_request_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyConsultationRequestRepository:
    """Construct the consultation request repository."""

    return SqlAlchemyConsultationRequestRepository(session=session)


def get_consultation_user_reader(
    user_repository: Annotated[SqlAlchemyUserRepository, Depends(get_user_repository)],
) -> AuthConsultationUserReader:
    """Construct the consultation user reader."""

    return AuthConsultationUserReader(user_repository=user_repository)


def get_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    """Construct the business id generator."""

    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_current_time_provider() -> SystemCurrentTimeProvider:
    """Construct current time provider."""

    return SystemCurrentTimeProvider()


def get_create_consultation_request_use_case(
    consultation_request_repository: Annotated[
        SqlAlchemyConsultationRequestRepository,
        Depends(get_consultation_request_repository),
    ],
    consultation_user_reader: Annotated[
        AuthConsultationUserReader,
        Depends(get_consultation_user_reader),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider,
        Depends(get_current_time_provider),
    ],
) -> CreateConsultationRequestUseCase:
    """Construct the consultation request creation use case."""

    return CreateConsultationRequestUseCase(
        consultation_request_repository=consultation_request_repository,
        consultation_user_reader=consultation_user_reader,
        snowflake_id_generator=snowflake_id_generator,
        current_time_provider=current_time_provider,
    )


__all__ = [
    "MiniProgramIdentity",
    "SystemCurrentTimeProvider",
    "get_create_consultation_request_use_case",
    "get_current_mini_program_identity",
    "get_current_time_provider",
    "get_consultation_request_repository",
    "get_consultation_user_reader",
    "get_snowflake_id_generator",
]
