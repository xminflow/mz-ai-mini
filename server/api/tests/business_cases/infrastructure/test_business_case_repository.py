from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core import InternalServerException
from mz_ai_backend.modules.business_cases.application.dtos import BusinessCaseReplacement
from mz_ai_backend.modules.business_cases.domain import BusinessCaseStatus
from mz_ai_backend.modules.business_cases.infrastructure.models import (
    BusinessCaseDocumentModel,
    BusinessCaseModel,
)
from mz_ai_backend.modules.business_cases.infrastructure.repositories import (
    SqlAlchemyBusinessCaseRepository,
)


class FakeScalarOneResult:
    def __init__(self, model) -> None:
        self._model = model

    def scalar_one_or_none(self):
        return self._model


class FakeScalarCollection:
    def __init__(self, models) -> None:
        self._models = models

    def all(self):
        return self._models


class FakeManyResult:
    def __init__(self, models) -> None:
        self._models = models

    def scalars(self):
        return FakeScalarCollection(self._models)


def _build_case_model(
    *,
    case_id: str,
    published_at: datetime | None = None,
    tags: tuple[str, ...] = ("连锁增长",),
) -> BusinessCaseModel:
    return BusinessCaseModel(
        case_id=case_id,
        title=f"Case {case_id}",
        summary=f"Summary {case_id}",
        tags=list(tags),
        cover_image_url=f"https://example.com/{case_id}.png",
        status=BusinessCaseStatus.PUBLISHED.value if published_at else BusinessCaseStatus.DRAFT.value,
        published_at=published_at,
        is_deleted=False,
        created_at=datetime(2026, 1, 1, 8, 0, 0),
        updated_at=datetime(2026, 1, 1, 8, 0, 0),
    )


def _build_document_models(case_id: str) -> list[BusinessCaseDocumentModel]:
    return [
        BusinessCaseDocumentModel(
            document_id=2001,
            case_id=case_id,
            document_type="business_case",
            title="Business Case",
            markdown_content="# Business Case",
            cover_image_url="https://example.com/business-case.png",
            is_deleted=False,
            created_at=datetime(2026, 1, 1, 8, 0, 0),
            updated_at=datetime(2026, 1, 1, 8, 0, 0),
        ),
        BusinessCaseDocumentModel(
            document_id=2002,
            case_id=case_id,
            document_type="market_research",
            title="Market Research",
            markdown_content="# Market Research",
            cover_image_url="https://example.com/market-research.png",
            is_deleted=False,
            created_at=datetime(2026, 1, 1, 8, 0, 0),
            updated_at=datetime(2026, 1, 1, 8, 0, 0),
        ),
        BusinessCaseDocumentModel(
            document_id=2003,
            case_id=case_id,
            document_type="ai_business_upgrade",
            title="AI Upgrade",
            markdown_content="# AI Upgrade",
            cover_image_url="https://example.com/ai-upgrade.png",
            is_deleted=False,
            created_at=datetime(2026, 1, 1, 8, 0, 0),
            updated_at=datetime(2026, 1, 1, 8, 0, 0),
        ),
    ]


@pytest.mark.asyncio
async def test_business_case_repository_returns_domain_aggregate_for_case_lookup() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeScalarOneResult(_build_case_model(case_id="1001")),
        FakeManyResult(_build_document_models("1001")),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    case = await repository.get_by_case_id("1001")

    assert case is not None
    assert case.case_id == "1001"
    assert case.tags == ("连锁增长",)
    assert case.documents.business_case.title == "Business Case"
    assert case.documents.market_research.document_id == 2002


@pytest.mark.asyncio
async def test_business_case_repository_list_admin_returns_page_slice() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.execute.return_value = FakeManyResult(
        [
            _build_case_model(case_id="1003"),
            _build_case_model(case_id="1002"),
            _build_case_model(case_id="1001"),
        ]
    )
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    page = await repository.list_admin(limit=2, cursor=None, status=None)

    assert len(page.items) == 2
    assert page.items[0].case_id == "1003"
    assert page.items[0].tags == ("连锁增长",)
    assert page.items[1].case_id == "1002"
    assert page.has_more is True


@pytest.mark.asyncio
async def test_business_case_repository_list_public_returns_available_tags() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeManyResult(
            [
                _build_case_model(
                    case_id="1003",
                    published_at=datetime(2026, 1, 3, 8, 0, 0),
                    tags=("连锁增长", "AI 提效"),
                ),
                _build_case_model(
                    case_id="1002",
                    published_at=datetime(2026, 1, 2, 8, 0, 0),
                    tags=("连锁增长",),
                ),
                _build_case_model(
                    case_id="1001",
                    published_at=datetime(2026, 1, 1, 8, 0, 0),
                    tags=("门店升级",),
                ),
            ]
        ),
        FakeManyResult(
            [
                _build_case_model(
                    case_id="1003",
                    published_at=datetime(2026, 1, 3, 8, 0, 0),
                    tags=("连锁增长", "AI 提效"),
                ),
                _build_case_model(
                    case_id="1002",
                    published_at=datetime(2026, 1, 2, 8, 0, 0),
                    tags=("连锁增长",),
                ),
                _build_case_model(
                    case_id="1001",
                    published_at=datetime(2026, 1, 1, 8, 0, 0),
                    tags=("门店升级",),
                ),
            ]
        ),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    page = await repository.list_public(limit=2, cursor=None, tag="连锁增长")

    assert len(page.items) == 2
    assert page.items[0].case_id == "1003"
    assert page.available_tags == ("连锁增长", "AI 提效", "门店升级")
    assert page.has_more is True
    assert "json_contains" in str(session.execute.await_args_list[0].args[0]).lower()


@pytest.mark.asyncio
async def test_business_case_repository_delete_marks_aggregate_and_documents_as_deleted() -> None:
    case_model = _build_case_model(case_id="1001")
    document_models = _build_document_models("1001")
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeScalarOneResult(case_model),
        FakeManyResult(document_models),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    deleted = await repository.delete("1001")

    assert deleted is True
    assert case_model.is_deleted is True
    assert all(model.is_deleted for model in document_models)
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_business_case_repository_replace_raises_for_incomplete_document_set() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeScalarOneResult(_build_case_model(case_id="1001")),
        FakeManyResult(_build_document_models("1001")[:2]),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    with pytest.raises(InternalServerException):
        await repository.replace(
            BusinessCaseReplacement(
                case_id="1001",
                title="Case Updated",
                summary="Summary Updated",
                tags=("私域增长",),
                cover_image_url="https://example.com/case-updated.png",
                status=BusinessCaseStatus.DRAFT,
                published_at=None,
                documents=(),
            )
        )
