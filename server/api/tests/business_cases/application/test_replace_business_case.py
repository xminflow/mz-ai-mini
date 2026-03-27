from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.business_cases.application import (
    BusinessCaseDocumentContent,
    ReplaceBusinessCaseCommand,
    ReplaceBusinessCaseUseCase,
)
from mz_ai_backend.modules.business_cases.domain import (
    BusinessCase,
    BusinessCaseDocument,
    BusinessCaseDocumentType,
    BusinessCaseDocuments,
    BusinessCaseNotFoundException,
    BusinessCaseStatus,
)


class FakeCurrentTimeProvider:
    def __init__(self, now: datetime) -> None:
        self._now = now

    def now(self) -> datetime:
        return self._now


class FakeBusinessCaseRepository:
    def __init__(
        self,
        *,
        existing_case: BusinessCase | None,
        replaced_case: BusinessCase | None,
    ) -> None:
        self._existing_case = existing_case
        self._replaced_case = replaced_case
        self.replacement = None

    async def get_by_case_id(self, case_id: str):
        return self._existing_case

    async def replace(self, replacement):
        self.replacement = replacement
        return self._replaced_case


def _build_case(
    *,
    case_id: str,
    status: BusinessCaseStatus,
    published_at: datetime | None,
) -> BusinessCase:
    created_at = datetime(2026, 1, 2, 3, 4, 5)
    documents = BusinessCaseDocuments(
        business_case=BusinessCaseDocument(
            document_id=2001,
            document_type=BusinessCaseDocumentType.BUSINESS_CASE,
            title="Business Case",
            markdown_content="# Business Case",
            cover_image_url="https://example.com/business-case.png",
            is_deleted=False,
            created_at=created_at,
            updated_at=created_at,
        ),
        market_research=BusinessCaseDocument(
            document_id=2002,
            document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
            title="Market Research",
            markdown_content="# Market Research",
            cover_image_url="https://example.com/market-research.png",
            is_deleted=False,
            created_at=created_at,
            updated_at=created_at,
        ),
        ai_business_upgrade=BusinessCaseDocument(
            document_id=2003,
            document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
            title="AI Upgrade",
            markdown_content="# AI Upgrade",
            cover_image_url="https://example.com/ai-upgrade.png",
            is_deleted=False,
            created_at=created_at,
            updated_at=created_at,
        ),
    )
    return BusinessCase(
        case_id=case_id,
        title="Case A",
        summary="Summary A",
        tags=("连锁增长", "AI 提效"),
        cover_image_url="https://example.com/case-a.png",
        status=status,
        published_at=published_at,
        created_at=created_at,
        updated_at=created_at,
        documents=documents,
        is_deleted=False,
    )


def _build_documents() -> tuple[BusinessCaseDocumentContent, ...]:
    return (
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.BUSINESS_CASE,
            title="Business Case Updated",
            markdown_content="# Business Case Updated",
            cover_image_url="https://example.com/business-case-updated.png",
        ),
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
            title="Market Research Updated",
            markdown_content="# Market Research Updated",
            cover_image_url="https://example.com/market-research-updated.png",
        ),
        BusinessCaseDocumentContent(
            document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
            title="AI Upgrade Updated",
            markdown_content="# AI Upgrade Updated",
            cover_image_url="https://example.com/ai-upgrade-updated.png",
        ),
    )


@pytest.mark.asyncio
async def test_replace_business_case_use_case_preserves_existing_published_at() -> None:
    existing_case = _build_case(
        case_id="1001",
        status=BusinessCaseStatus.PUBLISHED,
        published_at=datetime(2026, 1, 1, 9, 0, 0),
    )
    replaced_case = _build_case(
        case_id="1001",
        status=BusinessCaseStatus.PUBLISHED,
        published_at=datetime(2026, 1, 1, 9, 0, 0),
    )
    repository = FakeBusinessCaseRepository(
        existing_case=existing_case,
        replaced_case=replaced_case,
    )
    use_case = ReplaceBusinessCaseUseCase(
        business_case_repository=repository,
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 3, 10, 0, 0)),
    )

    result = await use_case.execute(
        ReplaceBusinessCaseCommand(
            case_id="1001",
            title="Case A Updated",
            summary="Summary A Updated",
            tags=("私域增长", "门店升级"),
            cover_image_url="https://example.com/case-a-updated.png",
            status=BusinessCaseStatus.PUBLISHED,
            documents=_build_documents(),
        )
    )

    assert repository.replacement is not None
    assert repository.replacement.published_at == datetime(2026, 1, 1, 9, 0, 0)
    assert repository.replacement.tags == ("私域增长", "门店升级")
    assert result.status == BusinessCaseStatus.PUBLISHED


@pytest.mark.asyncio
async def test_replace_business_case_use_case_clears_published_at_when_moving_to_draft() -> None:
    existing_case = _build_case(
        case_id="1001",
        status=BusinessCaseStatus.PUBLISHED,
        published_at=datetime(2026, 1, 1, 9, 0, 0),
    )
    replaced_case = _build_case(
        case_id="1001",
        status=BusinessCaseStatus.DRAFT,
        published_at=None,
    )
    repository = FakeBusinessCaseRepository(
        existing_case=existing_case,
        replaced_case=replaced_case,
    )
    use_case = ReplaceBusinessCaseUseCase(
        business_case_repository=repository,
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 3, 10, 0, 0)),
    )

    result = await use_case.execute(
        ReplaceBusinessCaseCommand(
            case_id="1001",
            title="Case A Updated",
            summary="Summary A Updated",
            tags=("私域增长",),
            cover_image_url="https://example.com/case-a-updated.png",
            status=BusinessCaseStatus.DRAFT,
            documents=_build_documents(),
        )
    )

    assert repository.replacement is not None
    assert repository.replacement.published_at is None
    assert repository.replacement.tags == ("私域增长",)
    assert result.status == BusinessCaseStatus.DRAFT


@pytest.mark.asyncio
async def test_replace_business_case_use_case_raises_not_found_for_missing_case() -> None:
    repository = FakeBusinessCaseRepository(existing_case=None, replaced_case=None)
    use_case = ReplaceBusinessCaseUseCase(
        business_case_repository=repository,
        current_time_provider=FakeCurrentTimeProvider(datetime(2026, 1, 3, 10, 0, 0)),
    )

    with pytest.raises(BusinessCaseNotFoundException):
        await use_case.execute(
            ReplaceBusinessCaseCommand(
                case_id="1001",
                title="Case A Updated",
                summary="Summary A Updated",
                tags=("私域增长",),
                cover_image_url="https://example.com/case-a-updated.png",
                status=BusinessCaseStatus.DRAFT,
                documents=_build_documents(),
            )
        )
