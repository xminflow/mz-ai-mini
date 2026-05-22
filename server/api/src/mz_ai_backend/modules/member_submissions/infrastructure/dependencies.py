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
from mz_ai_backend.modules.account_membership.infrastructure import (
    SqlAlchemyAccountMembershipRepository,
    get_account_membership_repository,
)
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator

from ..application import (
    CreateMemberSubmissionUseCase,
    DeleteMemberSubmissionUseCase,
    GetMyQuotaUseCase,
    ListMySubmissionsUseCase,
)
from .repositories import (
    AccountMembershipStatusReader,
    SqlAlchemyMemberSubmissionRepository,
)


class SystemCurrentTimeProvider:
    """Return current naive UTC datetime for persistence."""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def get_current_time_provider() -> SystemCurrentTimeProvider:
    return SystemCurrentTimeProvider()


def get_member_submission_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyMemberSubmissionRepository:
    return SqlAlchemyMemberSubmissionRepository(session=session)


def get_membership_status_reader(
    account_membership_repository: Annotated[
        SqlAlchemyAccountMembershipRepository,
        Depends(get_account_membership_repository),
    ],
) -> AccountMembershipStatusReader:
    return AccountMembershipStatusReader(
        account_membership_repository=account_membership_repository,
    )


def get_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_create_member_submission_use_case(
    repository: Annotated[
        SqlAlchemyMemberSubmissionRepository,
        Depends(get_member_submission_repository),
    ],
    membership_status_reader: Annotated[
        AccountMembershipStatusReader,
        Depends(get_membership_status_reader),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider,
        Depends(get_current_time_provider),
    ],
) -> CreateMemberSubmissionUseCase:
    return CreateMemberSubmissionUseCase(
        repository=repository,
        membership_status_reader=membership_status_reader,
        snowflake_id_generator=snowflake_id_generator,
        current_time_provider=current_time_provider,
    )


def get_get_my_quota_use_case(
    repository: Annotated[
        SqlAlchemyMemberSubmissionRepository,
        Depends(get_member_submission_repository),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider,
        Depends(get_current_time_provider),
    ],
) -> GetMyQuotaUseCase:
    return GetMyQuotaUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
    )


def get_delete_member_submission_use_case(
    repository: Annotated[
        SqlAlchemyMemberSubmissionRepository,
        Depends(get_member_submission_repository),
    ],
) -> DeleteMemberSubmissionUseCase:
    return DeleteMemberSubmissionUseCase(repository=repository)


def get_list_my_submissions_use_case(
    repository: Annotated[
        SqlAlchemyMemberSubmissionRepository,
        Depends(get_member_submission_repository),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider,
        Depends(get_current_time_provider),
    ],
) -> ListMySubmissionsUseCase:
    return ListMySubmissionsUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
    )
