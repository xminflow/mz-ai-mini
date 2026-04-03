from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock

import pytest
from mz_ai_backend.core import InternalServerException
from mz_ai_backend.modules.business_cases.application.dtos import (
    BusinessCaseDocumentReplacement,
    BusinessCaseReplacement,
)
from mz_ai_backend.modules.business_cases.domain import (
    BusinessCaseDocumentType,
    BusinessCaseIndustry,
    BusinessCaseStatus,
    BusinessCaseType,
)
from mz_ai_backend.modules.business_cases.infrastructure.models import (
    BusinessCaseDocumentModel,
    BusinessCaseModel,
)
from mz_ai_backend.modules.business_cases.infrastructure.repositories import (
    SqlAlchemyBusinessCaseRepository,
)
from sqlalchemy.ext.asyncio import AsyncSession


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
    case_type: str = "case",
    published_at: datetime | None = None,
    industry: str = "消费",
    tags: tuple[str, ...] = ("连锁增长",),
) -> BusinessCaseModel:
    return BusinessCaseModel(
        case_id=case_id,
        type=case_type,
        title=f"Case {case_id}",
        summary=f"Summary {case_id}",
        industry=industry,
        tags=list(tags),
        cover_image_url=f"https://example.com/{case_id}.png",
        status=BusinessCaseStatus.PUBLISHED.value
        if published_at
        else BusinessCaseStatus.DRAFT.value,
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
            is_deleted=False,
            created_at=datetime(2026, 1, 1, 8, 0, 0),
            updated_at=datetime(2026, 1, 1, 8, 0, 0),
        ),
        BusinessCaseDocumentModel(
            document_id=2003,
            case_id=case_id,
            document_type="business_model",
            title="Business Model",
            markdown_content="# Business Model",
            is_deleted=False,
            created_at=datetime(2026, 1, 1, 8, 0, 0),
            updated_at=datetime(2026, 1, 1, 8, 0, 0),
        ),
        BusinessCaseDocumentModel(
            document_id=2004,
            case_id=case_id,
            document_type="ai_business_upgrade",
            title="AI Upgrade",
            markdown_content="# AI Upgrade",
            is_deleted=False,
            created_at=datetime(2026, 1, 1, 8, 0, 0),
            updated_at=datetime(2026, 1, 1, 8, 0, 0),
        ),
    ]


def _build_project_document_models(case_id: str) -> list[BusinessCaseDocumentModel]:
    project_documents = _build_document_models(case_id)
    project_documents.pop(2)
    return project_documents + [
        BusinessCaseDocumentModel(
            document_id=2005,
            case_id=case_id,
            document_type="how_to_do",
            title="How To Do",
            markdown_content="# 如何做",
            is_deleted=False,
            created_at=datetime(2026, 1, 1, 8, 0, 0),
            updated_at=datetime(2026, 1, 1, 8, 0, 0),
        ),
    ]


def _build_document_replacements(
    *,
    include_business_model: bool = True,
    include_how_to_do: bool = False,
) -> tuple[BusinessCaseDocumentReplacement, ...]:
    document_replacements = [
        BusinessCaseDocumentReplacement(
            document_id=2001,
            document_type=BusinessCaseDocumentType.BUSINESS_CASE,
            title="Business Case",
            markdown_content="# Business Case",
        ),
        BusinessCaseDocumentReplacement(
            document_id=2002,
            document_type=BusinessCaseDocumentType.MARKET_RESEARCH,
            title="Market Research",
            markdown_content="# Market Research",
        ),
        BusinessCaseDocumentReplacement(
            document_id=2004,
            document_type=BusinessCaseDocumentType.AI_BUSINESS_UPGRADE,
            title="AI Upgrade",
            markdown_content="# AI Upgrade",
        ),
    ]
    if include_business_model:
        document_replacements.insert(
            2,
            BusinessCaseDocumentReplacement(
                document_id=2003,
                document_type=BusinessCaseDocumentType.BUSINESS_MODEL,
                title="Business Model",
                markdown_content="# Business Model",
            ),
        )
    if include_how_to_do:
        document_replacements.append(
            BusinessCaseDocumentReplacement(
                document_id=4001,
                document_type=BusinessCaseDocumentType.HOW_TO_DO,
                title="How To Do",
                markdown_content="# 如何做",
            )
        )

    return tuple(document_replacements)


@pytest.mark.asyncio
async def test_business_case_repository_returns_domain_aggregate_for_case_lookup() -> (
    None
):
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeScalarOneResult(_build_case_model(case_id="1001")),
        FakeManyResult(_build_document_models("1001")),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    case = await repository.get_by_case_id("1001")

    assert case is not None
    assert case.case_id == "1001"
    assert case.type == BusinessCaseType.CASE
    assert case.industry == BusinessCaseIndustry.CONSUMER
    assert case.tags == ("连锁增长",)
    assert case.documents.business_case.title == "Business Case"
    assert case.documents.market_research.document_id == 2002
    assert case.documents.business_model is not None
    assert case.documents.business_model.document_id == 2003


@pytest.mark.asyncio
async def test_business_case_repository_returns_project_how_to_do_document_when_present() -> None:
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeScalarOneResult(
            _build_case_model(case_id="1001", case_type=BusinessCaseType.PROJECT.value)
        ),
        FakeManyResult(_build_project_document_models("1001")),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    case = await repository.get_by_case_id("1001")

    assert case is not None
    assert case.type == BusinessCaseType.PROJECT
    assert case.documents.business_model is None
    assert case.documents.how_to_do is not None
    assert case.documents.how_to_do.document_id == 2005


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
    assert page.items[0].type == BusinessCaseType.CASE
    assert page.items[0].industry == BusinessCaseIndustry.CONSUMER
    assert page.items[0].tags == ("连锁增长",)
    assert page.items[1].case_id == "1002"
    assert page.has_more is True


@pytest.mark.asyncio
async def test_business_case_repository_list_public_filters_by_industry_and_keyword() -> (
    None
):
    session = AsyncMock(spec=AsyncSession)
    session.execute.return_value = FakeManyResult(
        [
            _build_case_model(
                case_id="1003",
                published_at=datetime(2026, 1, 3, 8, 0, 0),
                industry="消费",
                tags=("连锁增长", "AI 提效"),
            ),
            _build_case_model(
                case_id="1002",
                published_at=datetime(2026, 1, 2, 8, 0, 0),
                industry="消费",
                tags=("连锁增长",),
            ),
            _build_case_model(
                case_id="1001",
                published_at=datetime(2026, 1, 1, 8, 0, 0),
                industry="金融",
                tags=("门店升级",),
            ),
        ]
    )
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    page = await repository.list_public(
        limit=2,
        cursor=None,
        case_type=BusinessCaseType.PROJECT,
        industry=BusinessCaseIndustry.CONSUMER,
        keyword="增长",
    )

    assert len(page.items) == 2
    assert page.items[0].case_id == "1003"
    assert page.available_industries == (
        "科技",
        "消费",
        "金融",
        "医疗",
        "教育",
        "企业服务",
        "自媒体",
        "娱乐",
        "本地生活",
        "工业与供应链",
        "其他",
    )
    assert page.has_more is True
    statement_text = str(session.execute.await_args.args[0]).lower()
    assert "business_cases.type" in statement_text
    assert "business_cases.type =" in statement_text
    assert "business_cases.industry" in statement_text
    assert "business_case_documents" in statement_text
    assert "like" in statement_text


@pytest.mark.asyncio
async def test_business_case_repository_delete_marks_aggregate_and_documents_as_deleted() -> (
    None
):
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
async def test_business_case_repository_hard_delete_removes_case_and_documents() -> None:
    case_model = _build_case_model(case_id="1001")
    document_models = _build_document_models("1001")
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeScalarOneResult(case_model),
        FakeManyResult(document_models),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    deleted = await repository.hard_delete_by_case_id("1001")

    assert deleted is True
    assert session.delete.await_args_list[0].args == (document_models[0],)
    assert session.delete.await_args_list[1].args == (document_models[1],)
    assert session.delete.await_args_list[2].args == (document_models[2],)
    assert session.delete.await_args_list[3].args == (document_models[3],)
    assert session.delete.await_args_list[4].args == (case_model,)
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_business_case_repository_get_by_case_id_raises_for_incomplete_document_set() -> (
    None
):
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeScalarOneResult(_build_case_model(case_id="1001")),
        FakeManyResult(_build_document_models("1001")[:2]),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    with pytest.raises(InternalServerException):
        await repository.get_by_case_id("1001")


@pytest.mark.asyncio
async def test_business_case_repository_replace_adds_project_how_to_do_document() -> None:
    case_model = _build_case_model(case_id="1001")
    document_models = _build_document_models("1001")
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = [
        FakeScalarOneResult(case_model),
        FakeManyResult(document_models),
        FakeScalarOneResult(
            _build_case_model(case_id="1001", case_type=BusinessCaseType.PROJECT.value)
        ),
        FakeManyResult(_build_project_document_models("1001")),
    ]
    repository = SqlAlchemyBusinessCaseRepository(session=session)

    replaced_case = await repository.replace(
        BusinessCaseReplacement(
            case_id="1001",
            type=BusinessCaseType.PROJECT,
            title="Project Updated",
            summary="Summary Updated",
            industry=BusinessCaseIndustry.TECHNOLOGY,
            tags=("自动化",),
            cover_image_url="https://example.com/project-updated.png",
            status=BusinessCaseStatus.PUBLISHED,
            published_at=datetime(2026, 1, 1, 8, 0, 0),
            documents=_build_document_replacements(
                include_business_model=False,
                include_how_to_do=True,
            ),
        )
    )

    assert replaced_case is not None
    assert replaced_case.documents.business_model is None
    assert replaced_case.documents.how_to_do is not None
    assert session.add.call_count >= 1
