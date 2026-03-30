from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.modules.auth.domain import User, UserMembershipTier, UserStatus
from mz_ai_backend.modules.consultations.application import (
    ConsultationRequestRegistration,
)
from mz_ai_backend.modules.consultations.domain import ConsultationBusinessType
from mz_ai_backend.modules.consultations.infrastructure.repositories import (
    AuthConsultationUserReader,
    SqlAlchemyConsultationRequestRepository,
)
from mz_ai_backend.modules.consultations.infrastructure.models import (
    ConsultationRequestModel,
)


class StubUserRepository:
    def __init__(self, user: User | None) -> None:
        self._user = user

    async def get_by_openid(self, openid: str) -> User | None:
        if self._user is None:
            return None
        assert openid == self._user.openid
        return self._user


@pytest.mark.asyncio
async def test_consultation_repository_creates_request_and_returns_domain_entity() -> None:
    now = datetime.now(UTC).replace(tzinfo=None)
    session = AsyncMock(spec=AsyncSession)

    async def refresh(model: ConsultationRequestModel) -> None:
        model.id = 1
        model.created_at = now
        model.updated_at = now

    session.refresh.side_effect = refresh
    repository = SqlAlchemyConsultationRequestRepository(session=session)

    consultation_request = await repository.create(
        ConsultationRequestRegistration(
            consultation_id=182758122237067264,
            user_id=162758122237067264,
            openid="openid-10001",
            phone="13800138000",
            email="owner@example.com",
            business_type=ConsultationBusinessType.SYSTEM_INTEGRATION,
            business_type_other=None,
            business_description="需要梳理 AI 落地方案。",
            created_at=now,
        )
    )

    session.add.assert_called_once()
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once()
    assert consultation_request.consultation_id == 182758122237067264
    assert consultation_request.business_type == ConsultationBusinessType.SYSTEM_INTEGRATION
    assert consultation_request.created_at == now


@pytest.mark.asyncio
async def test_auth_consultation_user_reader_maps_auth_user() -> None:
    now = datetime.now(UTC).replace(tzinfo=None)
    user_reader = AuthConsultationUserReader(
        user_repository=StubUserRepository(
            User(
                user_id=162758122237067264,
                openid="openid-10001",
                union_id=None,
                nickname="妙智学员",
                avatar_url=None,
                status=UserStatus.ACTIVE,
                membership_tier=UserMembershipTier.NONE,
                membership_started_at=None,
                membership_expires_at=None,
                is_deleted=False,
                created_at=now,
                updated_at=now,
            )
        )
    )

    user = await user_reader.get_by_openid("openid-10001")

    assert user is not None
    assert user.user_id == 162758122237067264
    assert user.openid == "openid-10001"
