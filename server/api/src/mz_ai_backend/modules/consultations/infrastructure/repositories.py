from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.exceptions import InternalServerException
from mz_ai_backend.modules.auth.infrastructure import SqlAlchemyUserRepository

from ..application import AuthenticatedConsultationUser, ConsultationRequestRegistration
from ..domain import ConsultationBusinessType, ConsultationRequest
from .models import ConsultationRequestModel


def _to_domain_entity(model: ConsultationRequestModel) -> ConsultationRequest:
    return ConsultationRequest(
        consultation_id=model.consultation_id,
        user_id=model.user_id,
        openid=model.openid,
        phone=model.phone,
        email=model.email,
        business_type=ConsultationBusinessType(model.business_type),
        business_type_other=model.business_type_other,
        business_description=model.business_description,
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SqlAlchemyConsultationRequestRepository:
    """Persist consultation requests through SQLAlchemy."""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        registration: ConsultationRequestRegistration,
    ) -> ConsultationRequest:
        model = ConsultationRequestModel(
            consultation_id=registration.consultation_id,
            user_id=registration.user_id,
            openid=registration.openid,
            phone=registration.phone,
            email=registration.email,
            business_type=registration.business_type.value,
            business_type_other=registration.business_type_other,
            business_description=registration.business_description,
            is_deleted=False,
            created_at=registration.created_at,
            updated_at=registration.created_at,
        )
        self._session.add(model)
        try:
            await self._session.commit()
        except IntegrityError as exc:
            await self._session.rollback()
            raise InternalServerException(
                message="Failed to persist consultation request.",
            ) from exc

        await self._session.refresh(model)
        return _to_domain_entity(model)


class AuthConsultationUserReader:
    """Load the current consultation user through the auth repository."""

    def __init__(self, *, user_repository: SqlAlchemyUserRepository) -> None:
        self._user_repository = user_repository

    async def get_by_openid(self, openid: str) -> AuthenticatedConsultationUser | None:
        user = await self._user_repository.get_by_openid(openid)
        if user is None:
            return None
        return AuthenticatedConsultationUser(
            user_id=user.user_id,
            openid=user.openid,
        )
