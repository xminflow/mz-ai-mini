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
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator

from ..application import (
    CreateBusinessCaseUseCase,
    DeleteBusinessCaseUseCase,
    GetAdminBusinessCaseUseCase,
    GetPublicBusinessCaseUseCase,
    ListAdminBusinessCasesUseCase,
    ListPublicBusinessCasesUseCase,
    ReplaceBusinessCaseUseCase,
)
from .repositories import SqlAlchemyBusinessCaseRepository


class SystemCurrentTimeProvider:
    """Return the current naive UTC timestamp for persistence."""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def get_business_case_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyBusinessCaseRepository:
    """Construct the business case repository."""

    return SqlAlchemyBusinessCaseRepository(session=session)


def get_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    """Construct the business id generator."""

    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_current_time_provider() -> SystemCurrentTimeProvider:
    """Construct the current time provider."""

    return SystemCurrentTimeProvider()


def get_create_business_case_use_case(
    business_case_repository: Annotated[
        SqlAlchemyBusinessCaseRepository,
        Depends(get_business_case_repository),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider,
        Depends(get_current_time_provider),
    ],
) -> CreateBusinessCaseUseCase:
    """Construct the create business case use case."""

    return CreateBusinessCaseUseCase(
        business_case_repository=business_case_repository,
        snowflake_id_generator=snowflake_id_generator,
        current_time_provider=current_time_provider,
    )


def get_get_admin_business_case_use_case(
    business_case_repository: Annotated[
        SqlAlchemyBusinessCaseRepository,
        Depends(get_business_case_repository),
    ],
) -> GetAdminBusinessCaseUseCase:
    """Construct the admin detail use case."""

    return GetAdminBusinessCaseUseCase(
        business_case_repository=business_case_repository
    )


def get_get_public_business_case_use_case(
    business_case_repository: Annotated[
        SqlAlchemyBusinessCaseRepository,
        Depends(get_business_case_repository),
    ],
) -> GetPublicBusinessCaseUseCase:
    """Construct the public detail use case."""

    return GetPublicBusinessCaseUseCase(
        business_case_repository=business_case_repository
    )


def get_list_admin_business_cases_use_case(
    business_case_repository: Annotated[
        SqlAlchemyBusinessCaseRepository,
        Depends(get_business_case_repository),
    ],
) -> ListAdminBusinessCasesUseCase:
    """Construct the admin list use case."""

    return ListAdminBusinessCasesUseCase(
        business_case_repository=business_case_repository
    )


def get_list_public_business_cases_use_case(
    business_case_repository: Annotated[
        SqlAlchemyBusinessCaseRepository,
        Depends(get_business_case_repository),
    ],
) -> ListPublicBusinessCasesUseCase:
    """Construct the public list use case."""

    return ListPublicBusinessCasesUseCase(
        business_case_repository=business_case_repository
    )


def get_replace_business_case_use_case(
    business_case_repository: Annotated[
        SqlAlchemyBusinessCaseRepository,
        Depends(get_business_case_repository),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider,
        Depends(get_current_time_provider),
    ],
) -> ReplaceBusinessCaseUseCase:
    """Construct the replace business case use case."""

    return ReplaceBusinessCaseUseCase(
        business_case_repository=business_case_repository,
        snowflake_id_generator=snowflake_id_generator,
        current_time_provider=current_time_provider,
    )


def get_delete_business_case_use_case(
    business_case_repository: Annotated[
        SqlAlchemyBusinessCaseRepository,
        Depends(get_business_case_repository),
    ],
) -> DeleteBusinessCaseUseCase:
    """Construct the delete business case use case."""

    return DeleteBusinessCaseUseCase(
        business_case_repository=business_case_repository
    )
