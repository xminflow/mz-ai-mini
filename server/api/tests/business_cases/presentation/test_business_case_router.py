from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.core import ErrorCode
from mz_ai_backend.modules.business_cases.application import (
    BusinessCaseDetailResult,
    BusinessCaseDocumentResult,
    BusinessCaseDocumentsResult,
    BusinessCaseListItemResult,
    DeleteBusinessCaseResult,
    ListBusinessCasesResult,
)
from mz_ai_backend.modules.business_cases.domain import (
    BusinessCaseIndustry,
    BusinessCaseNotFoundException,
    BusinessCaseStatus,
    BusinessCaseType,
)
from mz_ai_backend.modules.business_cases.infrastructure.dependencies import (
    get_create_business_case_use_case,
    get_delete_business_case_use_case,
    get_get_public_business_case_use_case,
    get_list_admin_business_cases_use_case,
    get_list_public_business_cases_use_case,
)

CASE_ID = "case-4"
DOCUMENT_ID_BUSINESS_CASE = 162758122237067265
DOCUMENT_ID_MARKET_RESEARCH = 162758122237067266
DOCUMENT_ID_AI_BUSINESS_UPGRADE = 162758122237067267
DOCUMENT_ID_HOW_TO_DO = 162758122237067268


class StubCreateBusinessCaseUseCase:
    async def execute(self, command) -> BusinessCaseDetailResult:
        assert command.title == "Case A"
        assert command.type == BusinessCaseType.CASE
        assert command.industry == BusinessCaseIndustry.CONSUMER
        assert command.tags == ("连锁增长", "AI 提效")
        assert command.documents[0].document_type.value == "business_case"
        return _build_detail_result(case_id=CASE_ID, status=BusinessCaseStatus.DRAFT)


class StubListAdminBusinessCasesUseCase:
    async def execute(self, query) -> ListBusinessCasesResult:
        assert query.limit == 10
        assert query.cursor == "cursor-1"
        assert query.status == BusinessCaseStatus.DRAFT
        return ListBusinessCasesResult(
            items=(
                BusinessCaseListItemResult(
                    case_id=CASE_ID,
                    type=BusinessCaseType.CASE,
                    title="Case A",
                    summary="Summary A",
                    industry=BusinessCaseIndustry.CONSUMER,
                    tags=("连锁增长",),
                    cover_image_url="https://example.com/case-a.png",
                    status=BusinessCaseStatus.DRAFT,
                    published_at=None,
                    created_at=datetime(2026, 1, 1, 8, 0, 0),
                    updated_at=datetime(2026, 1, 1, 8, 0, 0),
                ),
            ),
            next_cursor="cursor-2",
        )


class StubListPublicBusinessCasesUseCase:
    async def execute(self, query) -> ListBusinessCasesResult:
        assert query.limit == 10
        assert query.cursor == "cursor-1"
        assert query.type == BusinessCaseType.CASE
        assert query.industry == BusinessCaseIndustry.CONSUMER
        assert query.keyword == "增长"
        return ListBusinessCasesResult(
            items=(
                BusinessCaseListItemResult(
                    case_id=CASE_ID,
                    type=BusinessCaseType.CASE,
                    title="Case A",
                    summary="Summary A",
                    industry=BusinessCaseIndustry.CONSUMER,
                    tags=("AI 提效",),
                    cover_image_url="https://example.com/case-a.png",
                    status=BusinessCaseStatus.PUBLISHED,
                    published_at=datetime(2026, 1, 1, 8, 0, 0),
                    created_at=datetime(2026, 1, 1, 8, 0, 0),
                    updated_at=datetime(2026, 1, 1, 8, 0, 0),
                ),
            ),
            next_cursor="cursor-3",
            available_industries=("科技", "消费"),
        )


class StubPublicDetailUseCase:
    def __init__(
        self,
        *,
        error: Exception | None = None,
        result: BusinessCaseDetailResult | None = None,
    ) -> None:
        self._error = error
        self._result = result

    async def execute(self, query) -> BusinessCaseDetailResult:
        assert query.case_id == CASE_ID
        if self._error is not None:
            raise self._error
        if self._result is not None:
            return self._result
        return _build_detail_result(case_id=CASE_ID, status=BusinessCaseStatus.PUBLISHED)


class StubDeleteBusinessCaseUseCase:
    async def execute(self, command) -> DeleteBusinessCaseResult:
        assert command.case_id == CASE_ID
        return DeleteBusinessCaseResult(case_id=CASE_ID)


def _build_detail_result(
    *,
    case_id: str,
    status: BusinessCaseStatus,
    case_type: BusinessCaseType = BusinessCaseType.CASE,
    include_how_to_do: bool = False,
) -> BusinessCaseDetailResult:
    return BusinessCaseDetailResult(
        case_id=case_id,
        type=case_type,
        title="Case A",
        summary="Summary A",
        industry=BusinessCaseIndustry.CONSUMER,
        tags=("连锁增长", "AI 提效"),
        cover_image_url="https://example.com/case-a.png",
        status=status,
        published_at=datetime(2026, 1, 1, 8, 0, 0)
        if status == BusinessCaseStatus.PUBLISHED
        else None,
        created_at=datetime(2026, 1, 1, 8, 0, 0),
        updated_at=datetime(2026, 1, 1, 8, 0, 0),
        documents=BusinessCaseDocumentsResult(
            business_case=BusinessCaseDocumentResult(
                document_id=DOCUMENT_ID_BUSINESS_CASE,
                title="Business Case",
                markdown_content="# Business Case",
            ),
            market_research=BusinessCaseDocumentResult(
                document_id=DOCUMENT_ID_MARKET_RESEARCH,
                title="Market Research",
                markdown_content="# Market Research",
            ),
            ai_business_upgrade=BusinessCaseDocumentResult(
                document_id=DOCUMENT_ID_AI_BUSINESS_UPGRADE,
                title="AI Upgrade",
                markdown_content="# AI Upgrade",
            ),
            how_to_do=(
                BusinessCaseDocumentResult(
                    document_id=DOCUMENT_ID_HOW_TO_DO,
                    title="How To Do",
                    markdown_content="# 如何做",
                )
                if include_how_to_do
                else None
            ),
        ),
    )


def _build_client(
    *,
    create_use_case: StubCreateBusinessCaseUseCase | None = None,
    list_admin_use_case: StubListAdminBusinessCasesUseCase | None = None,
    list_public_use_case: StubListPublicBusinessCasesUseCase | None = None,
    public_detail_use_case: StubPublicDetailUseCase | None = None,
    delete_use_case: StubDeleteBusinessCaseUseCase | None = None,
) -> TestClient:
    app = create_app()
    if create_use_case is not None:
        app.dependency_overrides[get_create_business_case_use_case] = (
            lambda: create_use_case
        )
    if list_admin_use_case is not None:
        app.dependency_overrides[get_list_admin_business_cases_use_case] = (
            lambda: list_admin_use_case
        )
    if list_public_use_case is not None:
        app.dependency_overrides[get_list_public_business_cases_use_case] = (
            lambda: list_public_use_case
        )
    if public_detail_use_case is not None:
        app.dependency_overrides[get_get_public_business_case_use_case] = (
            lambda: public_detail_use_case
        )
    if delete_use_case is not None:
        app.dependency_overrides[get_delete_business_case_use_case] = (
            lambda: delete_use_case
        )
    return TestClient(app, raise_server_exceptions=False)


def test_business_case_router_creates_business_case() -> None:
    with _build_client(create_use_case=StubCreateBusinessCaseUseCase()) as client:
        response = client.post(
            "/api/v1/admin/business-cases",
            json={
                "title": "Case A",
                "type": "case",
                "summary": "Summary A",
                "industry": "消费",
                "tags": ["连锁增长", "AI 提效"],
                "cover_image_url": "https://example.com/case-a.png",
                "status": "draft",
                "documents": {
                    "business_case": {
                        "title": "Business Case",
                        "markdown_content": "# Business Case",
                    },
                    "market_research": {
                        "title": "Market Research",
                        "markdown_content": "# Market Research",
                    },
                    "ai_business_upgrade": {
                        "title": "AI Upgrade",
                        "markdown_content": "# AI Upgrade",
                    },
                },
            },
            headers={"X-Request-Id": "business-case-create"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "business-case-create"
    assert body["data"]["case_id"] == str(CASE_ID)
    assert body["data"]["type"] == "case"
    assert body["data"]["industry"] == "消费"
    assert body["data"]["tags"] == ["连锁增长", "AI 提效"]
    assert body["data"]["documents"]["business_case"]["document_id"] == str(
        DOCUMENT_ID_BUSINESS_CASE
    )


def test_business_case_router_lists_admin_business_cases() -> None:
    with _build_client(
        list_admin_use_case=StubListAdminBusinessCasesUseCase()
    ) as client:
        response = client.get(
            "/api/v1/admin/business-cases?limit=10&cursor=cursor-1&status=draft"
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["items"][0]["case_id"] == str(CASE_ID)
    assert body["data"]["items"][0]["type"] == "case"
    assert body["data"]["items"][0]["tags"] == ["连锁增长"]
    assert body["data"]["next_cursor"] == "cursor-2"


def test_business_case_router_lists_public_business_cases_by_industry_and_keyword() -> None:
    with _build_client(
        list_public_use_case=StubListPublicBusinessCasesUseCase()
    ) as client:
        response = client.get(
            "/api/v1/business-cases?type=case&limit=10&cursor=cursor-1&industry=%E6%B6%88%E8%B4%B9&keyword=%E5%A2%9E%E9%95%BF"
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["items"][0]["type"] == "case"
    assert body["data"]["items"][0]["industry"] == "消费"
    assert body["data"]["items"][0]["tags"] == ["AI 提效"]
    assert body["data"]["next_cursor"] == "cursor-3"
    assert body["data"]["available_industries"] == ["科技", "消费"]


def test_business_case_router_returns_not_found_for_unpublished_public_detail() -> None:
    with _build_client(
        public_detail_use_case=StubPublicDetailUseCase(
            error=BusinessCaseNotFoundException(case_id=CASE_ID)
        )
    ) as client:
        response = client.get(f"/api/v1/business-cases/{CASE_ID}")

    body = response.json()
    assert response.status_code == 404
    assert body["code"] == ErrorCode.BUSINESS_CASE_NOT_FOUND.value


def test_business_case_router_returns_project_detail_with_how_to_do_document() -> None:
    with _build_client(
        public_detail_use_case=StubPublicDetailUseCase(
            result=_build_detail_result(
                case_id=CASE_ID,
                status=BusinessCaseStatus.PUBLISHED,
                case_type=BusinessCaseType.PROJECT,
                include_how_to_do=True,
            )
        )
    ) as client:
        response = client.get(f"/api/v1/business-cases/{CASE_ID}")

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["type"] == "project"
    assert body["data"]["documents"]["how_to_do"]["document_id"] == str(
        DOCUMENT_ID_HOW_TO_DO
    )


def test_business_case_router_rejects_invalid_public_type_filter() -> None:
    with _build_client(
        list_public_use_case=StubListPublicBusinessCasesUseCase()
    ) as client:
        response = client.get("/api/v1/business-cases?type=invalid")

    body = response.json()
    assert response.status_code == 422
    assert body["code"] == ErrorCode.COMMON_VALIDATION_ERROR.value


def test_business_case_router_returns_validation_error_for_invalid_payload() -> None:
    with _build_client(create_use_case=StubCreateBusinessCaseUseCase()) as client:
        response = client.post(
            "/api/v1/admin/business-cases",
            json={
                "title": "   ",
                "summary": "Summary A",
                "tags": ["连锁增长"],
                "cover_image_url": "not-a-url",
                "status": "draft",
                "documents": {
                    "business_case": {
                        "title": "Business Case",
                        "markdown_content": "# Business Case",
                    },
                    "market_research": {
                        "title": "Market Research",
                        "markdown_content": "# Market Research",
                    },
                    "ai_business_upgrade": {
                        "title": "AI Upgrade",
                        "markdown_content": "# AI Upgrade",
                    },
                },
            },
        )

    body = response.json()
    assert response.status_code == 422
    assert body["code"] == ErrorCode.COMMON_VALIDATION_ERROR.value


def test_business_case_router_deletes_business_case() -> None:
    with _build_client(delete_use_case=StubDeleteBusinessCaseUseCase()) as client:
        response = client.delete(f"/api/v1/admin/business-cases/{CASE_ID}")

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["case_id"] == str(CASE_ID)
