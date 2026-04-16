from __future__ import annotations

from mz_ai_backend.core.logging import get_logger
from mz_ai_backend.modules.auth.domain import UserNotFoundException

from ...domain import CaseResearchVisibility
from ..dtos import (
    CaseResearchRequestRegistration,
    CreatePublicCaseResearchRequestCommand,
    CreatePublicCaseResearchRequestResult,
)
from ..ports import CaseResearchRepository, SnowflakeIdGenerator

case_research_logger = get_logger("mz_ai_backend.case_research")


class CreatePublicCaseResearchRequestUseCase:
    """Create one public case research request directly without payment."""

    def __init__(
        self,
        *,
        case_research_repository: CaseResearchRepository,
        snowflake_id_generator: SnowflakeIdGenerator,
    ) -> None:
        self._case_research_repository = case_research_repository
        self._snowflake_id_generator = snowflake_id_generator

    async def execute(
        self,
        command: CreatePublicCaseResearchRequestCommand,
    ) -> CreatePublicCaseResearchRequestResult:
        user_id = await self._case_research_repository.get_user_id_by_openid(
            openid=command.identity.openid,
        )
        if user_id is None:
            raise UserNotFoundException()

        request_id = self._snowflake_id_generator.generate()
        request = await self._case_research_repository.create_request(
            CaseResearchRequestRegistration(
                request_id=request_id,
                user_id=user_id,
                openid=command.identity.openid,
                title=command.title,
                description=command.description,
                visibility=CaseResearchVisibility.PUBLIC,
            )
        )

        case_research_logger.info(
            "case_research.public_request_created request_id=%s user_id=%s",
            request.request_id,
            request.user_id,
        )
        return CreatePublicCaseResearchRequestResult(
            request_id=request.request_id,
            visibility=request.visibility,
            status=request.status,
            created_at=request.created_at,
        )
