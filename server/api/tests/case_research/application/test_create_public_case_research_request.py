from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.auth.domain import UserNotFoundException
from mz_ai_backend.modules.case_research.application import (
    CreatePublicCaseResearchRequestCommand,
    CreatePublicCaseResearchRequestUseCase,
    MiniProgramIdentity,
)
from mz_ai_backend.modules.case_research.application.dtos import (
    CaseResearchOrderRegistration,
    CaseResearchRequestRegistration,
)
from mz_ai_backend.modules.case_research.domain import (
    CaseResearchOrder,
    CaseResearchOrderStatus,
    CaseResearchRequest,
    CaseResearchRequestStatus,
    CaseResearchVisibility,
)
from mz_ai_backend.shared.wechat_pay import WechatPayNotification


class StubCaseResearchRepository:
    def __init__(self, *, user_id: int | None = 10001) -> None:
        self._user_id = user_id
        self.last_registration: CaseResearchRequestRegistration | None = None

    async def get_user_id_by_openid(self, *, openid: str) -> int | None:
        return self._user_id

    async def create_request(self, registration: CaseResearchRequestRegistration) -> CaseResearchRequest:
        self.last_registration = registration
        return CaseResearchRequest(
            request_id=registration.request_id,
            user_id=registration.user_id,
            openid=registration.openid,
            title=registration.title,
            description=registration.description,
            visibility=registration.visibility,
            status=CaseResearchRequestStatus.PENDING_REVIEW,
            linked_case_id=None,
            is_deleted=False,
            created_at=datetime.now(UTC).replace(tzinfo=None),
            updated_at=datetime.now(UTC).replace(tzinfo=None),
        )

    async def create_pending_order(self, registration: CaseResearchOrderRegistration) -> CaseResearchOrder:
        raise NotImplementedError

    async def update_order_prepay_id(self, *, order_no: str, prepay_id: str) -> CaseResearchOrder:
        raise NotImplementedError

    async def get_order_by_order_no_and_openid(self, *, order_no: str, openid: str) -> CaseResearchOrder | None:
        return None

    async def process_wechat_pay_notification(
        self, *, notification: WechatPayNotification, snowflake_id: int
    ) -> CaseResearchOrder:
        raise NotImplementedError

    async def list_private_requests_by_openid(self, *, openid: str) -> list[CaseResearchRequest]:
        return []


class StubSnowflakeIdGenerator:
    def generate(self) -> int:
        return 182758122237067264


def _build_command() -> CreatePublicCaseResearchRequestCommand:
    return CreatePublicCaseResearchRequestCommand(
        identity=MiniProgramIdentity(openid="openid-10001", app_id="wx-app-id", union_id=None),
        title="示范科技公司案例调研",
        description="主要从事 AI 赋能企业数字化转型业务。",
    )


@pytest.mark.asyncio
async def test_create_public_request_creates_request() -> None:
    repository = StubCaseResearchRepository()
    use_case = CreatePublicCaseResearchRequestUseCase(
        case_research_repository=repository,
        snowflake_id_generator=StubSnowflakeIdGenerator(),
    )

    result = await use_case.execute(_build_command())

    assert repository.last_registration is not None
    assert repository.last_registration.visibility == CaseResearchVisibility.PUBLIC
    assert repository.last_registration.title == "示范科技公司案例调研"
    assert result.request_id == 182758122237067264
    assert result.visibility == CaseResearchVisibility.PUBLIC
    assert result.status == CaseResearchRequestStatus.PENDING_REVIEW


@pytest.mark.asyncio
async def test_create_public_request_raises_when_user_not_found() -> None:
    repository = StubCaseResearchRepository(user_id=None)
    use_case = CreatePublicCaseResearchRequestUseCase(
        case_research_repository=repository,
        snowflake_id_generator=StubSnowflakeIdGenerator(),
    )

    with pytest.raises(UserNotFoundException):
        await use_case.execute(_build_command())
