from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.business_cases.application import (
    BusinessCaseDocumentContent,
    CreateBusinessCaseCommand,
    CreateBusinessCaseUseCase,
)
from mz_ai_backend.modules.business_cases.domain import (
    BusinessCase,
    BusinessCaseDocument,
    BusinessCaseIndustry,
    BusinessCaseDocumentType,
    BusinessCaseDocuments,
    BusinessCaseInvalidDocumentSetException,
    BusinessCaseStatus,
)


class FakeSnowflakeIdGenerator:
    def __init__(self, values: list[int]) -> None:
        self._values = values

    def generate(self) -> int:
        return self._values.pop(0)


class FakeCurrentTimeProvider:
    def __init__(self, now: datetime) -> None:
        self._now = now

    def now(self) -> datetime:
        return self._now


class FakeBusinessCaseRepository:
    def __init__(self) -> None:
        self.registration = None

    async def create(self, registration):
        self.registration = registration
        created_at = datetime(2026, 1, 2, 3, 4, 5)
        documents = BusinessCaseDocuments(
            business_case=BusinessCaseDocument(
                document_id=registration.documents[0].document_id,
                document_type=registration.documents[0].document_type,
                title=registration.documents[0].title,
                markdown_content=registration.documents[0].markdown_content,
                is_deleted=False,
                created_at=created_at,
                updated_at=created_at,
            ),
            market_research=BusinessCaseDocument(
                document_id=registration.documents[1].document_id,
                document_type=registration.documents[1].document_type,
                title=registration.documents[1].title,
                markdown_content=registration.documents[1].markdown_content,
                is_deleted=False,
                created_at=created_at,
                updated_at=created_at,
            ),
            ai_business_upgrade=BusinessCaseDocument(
                document_id=registration.documents[2].document_id,
                document_type=registration.documents[2].document_type,
                title=registration.documents[2].title,
                markdown_content=registration.documents[2].markdown_content,
                is_deleted=False,
                created_at=created_at,
                updated_at=created_at,
            ),
        )
        return BusinessCase(
            case_id=registration.case_id,
            title=registration.title,
            summary=registration.summary,
            industry=registration.industry,
            tags=registration.tags,
            cover_image_url=registration.cover_image_url,
            status=registration.status,
            published_at=registration.published_at,
            created_at=created_at,
            updated_at=created_at,
            documents=documents,
            is_deleted=False,
        )


def _build_document_contents() -> tuple[BusinessCaseDocumentContent, ...]:
    return (
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.BUSINESS_CASE,
            title="Business Case",
            markdown_content="# Business Case",
        ),
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
            title="Market Research",
            markdown_content="# Market Research",
        ),
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
            title="AI Upgrade",
            markdown_content="# AI Upgrade",
        ),
    )


@pytest.mark.asyncio
async def test_create_business_case_use_case_generates_ids_and_published_at() -> None:
    repository = FakeBusinessCaseRepository()
    use_case = CreateBusinessCaseUseCase(
        business_case_repository=repository,
        snowflake_id_generator=FakeSnowflakeIdGenerator([1001, 2001, 2002, 2003]),
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 1, 8, 0, 0)),
    )

    result = await use_case.execute(
        CreateBusinessCaseCommand(
            title="Case A",
            summary="Summary A",
            industry=BusinessCaseIndustry.CONSUMER,
            tags=("连锁增长", "AI 提效"),
            cover_image_url="https://example.com/case-a.png",
            status=BusinessCaseStatus.PUBLISHED,
            documents=_build_document_contents(),
        )
    )

    assert repository.registration is not None
    assert repository.registration.case_id == "1001"
    assert repository.registration.published_at == datetime(2026, 1, 1, 8, 0, 0)
    assert repository.registration.industry == BusinessCaseIndustry.CONSUMER
    assert repository.registration.tags == ("连锁增长", "AI 提效")
    assert [document.document_id for document in repository.registration.documents] == [
        2001,
        2002,
        2003,
    ]
    assert result.case_id == "1001"
    assert result.industry == BusinessCaseIndustry.CONSUMER
    assert result.status == BusinessCaseStatus.PUBLISHED
    assert result.tags == ("连锁增长", "AI 提效")
    assert result.documents.business_case.document_id == 2001


@pytest.mark.asyncio
async def test_create_business_case_use_case_preserves_supplied_case_id() -> None:
    repository = FakeBusinessCaseRepository()
    use_case = CreateBusinessCaseUseCase(
        business_case_repository=repository,
        snowflake_id_generator=FakeSnowflakeIdGenerator([2001, 2002, 2003]),
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 1, 8, 0, 0)),
    )

    result = await use_case.execute(
        CreateBusinessCaseCommand(
            case_id="case-4",
            title="Case A",
            summary="Summary A",
            industry=BusinessCaseIndustry.ENTERTAINMENT,
            tags=("连锁增长", "AI 提效"),
            cover_image_url="https://example.com/case-a.png",
            status=BusinessCaseStatus.PUBLISHED,
            documents=_build_document_contents(),
        )
    )

    assert repository.registration is not None
    assert repository.registration.case_id == "case-4"
    assert repository.registration.industry == BusinessCaseIndustry.ENTERTAINMENT
    assert [document.document_id for document in repository.registration.documents] == [
        2001,
        2002,
        2003,
    ]
    assert result.case_id == "case-4"


@pytest.mark.asyncio
async def test_create_business_case_use_case_rejects_invalid_document_set() -> None:
    repository = FakeBusinessCaseRepository()
    use_case = CreateBusinessCaseUseCase(
        business_case_repository=repository,
        snowflake_id_generator=FakeSnowflakeIdGenerator([1001, 2001, 2002, 2003]),
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 1, 8, 0, 0)),
    )

    with pytest.raises(BusinessCaseInvalidDocumentSetException):
        await use_case.execute(
            CreateBusinessCaseCommand(
                title="Case A",
                summary="Summary A",
                industry=BusinessCaseIndustry.OTHER,
                tags=("连锁增长",),
                cover_image_url="https://example.com/case-a.png",
                status=BusinessCaseStatus.DRAFT,
                documents=(
                    BusinessCaseDocumentContent(
                        document_type=BusinessCaseDocumentType.BUSINESS_CASE,
                        title="Business Case",
                        markdown_content="# Business Case",
                    ),
                    BusinessCaseDocumentContent(
                        document_type=BusinessCaseDocumentType.BUSINESS_CASE,
                        title="Business Case 2",
                        markdown_content="# Business Case 2",
                    ),
                    BusinessCaseDocumentContent(
                        document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
                        title="Market Research",
                        markdown_content="# Market Research",
                    ),
                ),
            )
        )
