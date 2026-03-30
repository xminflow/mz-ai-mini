from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.core.exceptions import ValidationException
from mz_ai_backend.modules.auth.application import MiniProgramIdentity
from mz_ai_backend.modules.auth.domain import UserNotFoundException
from mz_ai_backend.modules.consultations.application import (
    AuthenticatedConsultationUser,
    CreateConsultationRequestCommand,
    CreateConsultationRequestUseCase,
)
from mz_ai_backend.modules.consultations.domain import (
    ConsultationBusinessType,
    ConsultationRequest,
)


class StubConsultationRequestRepository:
    def __init__(self) -> None:
        self.registration = None

    async def create(self, registration) -> ConsultationRequest:
        self.registration = registration
        return ConsultationRequest(
            consultation_id=registration.consultation_id,
            user_id=registration.user_id,
            openid=registration.openid,
            phone=registration.phone,
            email=registration.email,
            business_type=registration.business_type,
            business_type_other=registration.business_type_other,
            business_description=registration.business_description,
            is_deleted=False,
            created_at=registration.created_at,
            updated_at=registration.created_at,
        )


class StubConsultationUserReader:
    def __init__(self, user: AuthenticatedConsultationUser | None) -> None:
        self._user = user

    async def get_by_openid(self, openid: str) -> AuthenticatedConsultationUser | None:
        if self._user is None:
            return None
        assert openid == self._user.openid
        return self._user


class StubSnowflakeIdGenerator:
    def generate(self) -> int:
        return 182758122237067264


class StubCurrentTimeProvider:
    def __init__(self, now: datetime) -> None:
        self._now = now

    def now(self) -> datetime:
        return self._now


def _build_command(
    *,
    business_type: str = "system_integration",
    business_type_other: str | None = None,
) -> CreateConsultationRequestCommand:
    return CreateConsultationRequestCommand(
        identity=MiniProgramIdentity(
            openid="openid-10001",
            app_id="wx-app-id",
            union_id=None,
        ),
        phone="13800138000",
        email="owner@example.com",
        business_type=business_type,
        business_type_other=business_type_other,
        business_description="希望通过 AI 升级现有业务流程。",
    )


@pytest.mark.asyncio
async def test_create_consultation_request_use_case_creates_request() -> None:
    now = datetime.now(UTC).replace(tzinfo=None)
    repository = StubConsultationRequestRepository()
    use_case = CreateConsultationRequestUseCase(
        consultation_request_repository=repository,
        consultation_user_reader=StubConsultationUserReader(
            AuthenticatedConsultationUser(
                user_id=162758122237067264,
                openid="openid-10001",
            )
        ),
        snowflake_id_generator=StubSnowflakeIdGenerator(),
        current_time_provider=StubCurrentTimeProvider(now),
    )

    result = await use_case.execute(_build_command())

    assert repository.registration is not None
    assert repository.registration.business_type == ConsultationBusinessType.SYSTEM_INTEGRATION
    assert repository.registration.business_type_other is None
    assert result.consultation_id == 182758122237067264
    assert result.submitted_at == now


@pytest.mark.asyncio
async def test_create_consultation_request_use_case_rejects_missing_other_detail() -> None:
    use_case = CreateConsultationRequestUseCase(
        consultation_request_repository=StubConsultationRequestRepository(),
        consultation_user_reader=StubConsultationUserReader(
            AuthenticatedConsultationUser(
                user_id=162758122237067264,
                openid="openid-10001",
            )
        ),
        snowflake_id_generator=StubSnowflakeIdGenerator(),
        current_time_provider=StubCurrentTimeProvider(
            datetime.now(UTC).replace(tzinfo=None)
        ),
    )

    with pytest.raises(ValidationException) as error:
        await use_case.execute(_build_command(business_type="other"))

    assert error.value.message == (
        "Business type other text is required when business type is other."
    )


@pytest.mark.asyncio
async def test_create_consultation_request_use_case_rejects_missing_user() -> None:
    use_case = CreateConsultationRequestUseCase(
        consultation_request_repository=StubConsultationRequestRepository(),
        consultation_user_reader=StubConsultationUserReader(None),
        snowflake_id_generator=StubSnowflakeIdGenerator(),
        current_time_provider=StubCurrentTimeProvider(
            datetime.now(UTC).replace(tzinfo=None)
        ),
    )

    with pytest.raises(UserNotFoundException):
        await use_case.execute(_build_command())
