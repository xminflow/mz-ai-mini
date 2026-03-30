from __future__ import annotations

from mz_ai_backend.core.exceptions import ValidationException
from mz_ai_backend.core.logging import get_logger
from mz_ai_backend.modules.auth.domain import UserNotFoundException

from ...domain import ConsultationBusinessType
from ..dtos import (
    ConsultationRequestRegistration,
    CreateConsultationRequestCommand,
    CreateConsultationRequestResult,
)
from ..ports import (
    ConsultationRequestRepository,
    ConsultationUserReader,
    CurrentTimeProvider,
    SnowflakeIdGenerator,
)


consultation_logger = get_logger("mz_ai_backend.consultations")


def _resolve_business_type(value: str) -> ConsultationBusinessType:
    try:
        return ConsultationBusinessType(value.strip())
    except ValueError as exc:
        raise ValidationException(message="Unsupported consultation business type.") from exc


def _resolve_business_type_other(
    *,
    business_type: ConsultationBusinessType,
    business_type_other: str | None,
) -> str | None:
    normalized = business_type_other.strip() if business_type_other is not None else None
    if business_type == ConsultationBusinessType.OTHER:
        if normalized is None or normalized == "":
            raise ValidationException(
                message=(
                    "Business type other text is required when business type is other."
                ),
            )
        return normalized

    return None


class CreateConsultationRequestUseCase:
    """Create one consultation request aggregate."""

    def __init__(
        self,
        *,
        consultation_request_repository: ConsultationRequestRepository,
        consultation_user_reader: ConsultationUserReader,
        snowflake_id_generator: SnowflakeIdGenerator,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._consultation_request_repository = consultation_request_repository
        self._consultation_user_reader = consultation_user_reader
        self._snowflake_id_generator = snowflake_id_generator
        self._current_time_provider = current_time_provider

    async def execute(
        self,
        command: CreateConsultationRequestCommand,
    ) -> CreateConsultationRequestResult:
        user = await self._consultation_user_reader.get_by_openid(command.identity.openid)
        if user is None:
            raise UserNotFoundException()

        business_type = _resolve_business_type(command.business_type)
        business_type_other = _resolve_business_type_other(
            business_type=business_type,
            business_type_other=command.business_type_other,
        )
        created_request = await self._consultation_request_repository.create(
            registration=ConsultationRequestRegistration(
                consultation_id=self._snowflake_id_generator.generate(),
                user_id=user.user_id,
                openid=user.openid,
                phone=command.phone,
                email=command.email,
                business_type=business_type,
                business_type_other=business_type_other,
                business_description=command.business_description,
                created_at=self._current_time_provider.now(),
            )
        )
        consultation_logger.info(
            "consultation_request.created consultation_id=%s user_id=%s business_type=%s",
            created_request.consultation_id,
            created_request.user_id,
            created_request.business_type.value,
        )
        return CreateConsultationRequestResult(
            consultation_id=created_request.consultation_id,
            submitted_at=created_request.created_at,
        )
