from __future__ import annotations

from datetime import date, datetime

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
    BusinessCaseType,
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
        document_map = {
            document.document_type: BusinessCaseDocument(
                document_id=document.document_id,
                document_type=document.document_type,
                title=document.title,
                markdown_content=document.markdown_content,
                is_deleted=False,
                created_at=created_at,
                updated_at=created_at,
            )
            for document in registration.documents
        }
        documents = BusinessCaseDocuments(
            business_case=document_map[BusinessCaseDocumentType.BUSINESS_CASE],
            market_research=document_map[BusinessCaseDocumentType.MARKET_RESEARCH],
            business_model=document_map.get(BusinessCaseDocumentType.BUSINESS_MODEL),
            ai_business_upgrade=document_map[BusinessCaseDocumentType.AI_BUSINESS_UPGRADE],
            how_to_do=document_map.get(BusinessCaseDocumentType.HOW_TO_DO),
        )
        return BusinessCase(
            case_id=registration.case_id,
            type=registration.type,
            title=registration.title,
            summary=registration.summary,
            summary_markdown=registration.summary_markdown,
            data_cutoff_date=registration.data_cutoff_date,
            freshness_months=registration.freshness_months,
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
            document_type=BusinessCaseDocumentType.BUSINESS_MODEL,
            title="Business Model",
            markdown_content="# Business Model",
        ),
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
            title="AI Upgrade",
            markdown_content="# AI Upgrade",
        ),
    )


def _build_project_document_contents() -> tuple[BusinessCaseDocumentContent, ...]:
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
            document_type=BusinessCaseDocumentType.BUSINESS_MODEL,
            title="Business Model",
            markdown_content="# Business Model",
        ),
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
            title="AI Upgrade",
            markdown_content="# AI Upgrade",
        ),
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.HOW_TO_DO,
            title="How To Do",
            markdown_content="# 如何做",
        ),
    )


@pytest.mark.asyncio
async def test_create_business_case_use_case_generates_ids_and_published_at() -> None:
    repository = FakeBusinessCaseRepository()
    use_case = CreateBusinessCaseUseCase(
        business_case_repository=repository,
        snowflake_id_generator=FakeSnowflakeIdGenerator([1001, 2001, 2002, 2003, 2004]),
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 1, 8, 0, 0)),
    )

    result = await use_case.execute(
        CreateBusinessCaseCommand(
            type=BusinessCaseType.CASE,
            title="Case A",
            summary="Summary A",
            summary_markdown="# Summary A",
            data_cutoff_date=date(2026, 4, 13),
            freshness_months=3,
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
    assert repository.registration.type == BusinessCaseType.CASE
    assert repository.registration.summary_markdown == "# Summary A"
    assert repository.registration.data_cutoff_date == date(2026, 4, 13)
    assert repository.registration.freshness_months == 3
    assert repository.registration.industry == BusinessCaseIndustry.CONSUMER
    assert repository.registration.tags == ("连锁增长", "AI 提效")
    assert [document.document_id for document in repository.registration.documents] == [
        2001,
        2002,
        2003,
        2004,
    ]
    assert result.case_id == "1001"
    assert result.type == BusinessCaseType.CASE
    assert result.summary_markdown == "# Summary A"
    assert result.data_cutoff_date == date(2026, 4, 13)
    assert result.freshness_months == 3
    assert result.industry == BusinessCaseIndustry.CONSUMER
    assert result.status == BusinessCaseStatus.PUBLISHED
    assert result.tags == ("连锁增长", "AI 提效")
    assert result.documents.business_case.document_id == 2001
    assert result.documents.business_model is not None
    assert result.documents.business_model.document_id == 2003


@pytest.mark.asyncio
async def test_create_business_case_use_case_preserves_supplied_case_id() -> None:
    repository = FakeBusinessCaseRepository()
    use_case = CreateBusinessCaseUseCase(
        business_case_repository=repository,
        snowflake_id_generator=FakeSnowflakeIdGenerator([2001, 2002, 2003, 2004, 2005]),
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 1, 8, 0, 0)),
    )

    result = await use_case.execute(
        CreateBusinessCaseCommand(
            case_id="case-4",
            type=BusinessCaseType.PROJECT,
            title="Case A",
            summary="Summary A",
            summary_markdown="# Summary A",
            data_cutoff_date=date(2026, 4, 13),
            freshness_months=6,
            industry=BusinessCaseIndustry.ENTERTAINMENT,
            tags=("连锁增长", "AI 提效"),
            cover_image_url="https://example.com/case-a.png",
            status=BusinessCaseStatus.PUBLISHED,
            documents=_build_project_document_contents(),
        )
    )

    assert repository.registration is not None
    assert repository.registration.case_id == "case-4"
    assert repository.registration.type == BusinessCaseType.PROJECT
    assert repository.registration.summary_markdown == "# Summary A"
    assert repository.registration.data_cutoff_date == date(2026, 4, 13)
    assert repository.registration.freshness_months == 6
    assert repository.registration.industry == BusinessCaseIndustry.ENTERTAINMENT
    assert [document.document_id for document in repository.registration.documents] == [
        2001,
        2002,
        2003,
        2004,
        2005,
    ]
    assert result.case_id == "case-4"
    assert result.type == BusinessCaseType.PROJECT
    assert result.summary_markdown == "# Summary A"
    assert result.documents.how_to_do is not None


@pytest.mark.asyncio
async def test_create_business_case_use_case_accepts_project_how_to_do_document() -> None:
    repository = FakeBusinessCaseRepository()
    use_case = CreateBusinessCaseUseCase(
        business_case_repository=repository,
        snowflake_id_generator=FakeSnowflakeIdGenerator(
            [1001, 2001, 2002, 2003, 2004, 2005]
        ),
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 1, 8, 0, 0)),
    )

    result = await use_case.execute(
        CreateBusinessCaseCommand(
            type=BusinessCaseType.PROJECT,
            title="Project A",
            summary="Project Summary",
            summary_markdown="# Project Summary",
            data_cutoff_date=date(2026, 4, 13),
            freshness_months=3,
            industry=BusinessCaseIndustry.TECHNOLOGY,
            tags=("自动化", "增长"),
            cover_image_url="https://example.com/project-a.png",
            status=BusinessCaseStatus.PUBLISHED,
            documents=_build_project_document_contents(),
        )
    )

    assert repository.registration is not None
    assert len(repository.registration.documents) == 5
    assert repository.registration.documents[-1].document_type == BusinessCaseDocumentType.HOW_TO_DO
    assert result.documents.how_to_do is not None
    assert result.documents.how_to_do.document_id == 2005


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
                type=BusinessCaseType.CASE,
                title="Case A",
                summary="Summary A",
                summary_markdown="# Summary A",
                data_cutoff_date=date(2026, 4, 13),
                freshness_months=3,
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
                    BusinessCaseDocumentContent(
                        document_type=BusinessCaseDocumentType.BUSINESS_MODEL,
                        title="Business Model",
                        markdown_content="# Business Model",
                    ),
                ),
            )
        )


@pytest.mark.asyncio
async def test_create_business_case_use_case_rejects_project_without_how_to_do() -> None:
    repository = FakeBusinessCaseRepository()
    use_case = CreateBusinessCaseUseCase(
        business_case_repository=repository,
        snowflake_id_generator=FakeSnowflakeIdGenerator([1001, 2001, 2002, 2003, 2004]),
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 1, 8, 0, 0)),
    )

    with pytest.raises(BusinessCaseInvalidDocumentSetException):
        await use_case.execute(
            CreateBusinessCaseCommand(
                type=BusinessCaseType.PROJECT,
                title="Project A",
                summary="Project Summary",
                summary_markdown="# Project Summary",
                data_cutoff_date=date(2026, 4, 13),
                freshness_months=3,
                industry=BusinessCaseIndustry.OTHER,
                tags=("增长",),
                cover_image_url="https://example.com/project-a.png",
                status=BusinessCaseStatus.DRAFT,
                documents=_build_document_contents(),
            )
        )
