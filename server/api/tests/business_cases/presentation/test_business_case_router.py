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
    BusinessCaseNotFoundException,
    BusinessCaseStatus,
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


class StubCreateBusinessCaseUseCase:
    async def execute(self, command) -> BusinessCaseDetailResult:
        assert command.title == "Case A"
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
                    title="Case A",
                    summary="Summary A",
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
        assert query.tag == "AI 提效"
        return ListBusinessCasesResult(
            items=(
                BusinessCaseListItemResult(
                    case_id=CASE_ID,
                    title="Case A",
                    summary="Summary A",
                    tags=("AI 提效",),
                    cover_image_url="https://example.com/case-a.png",
                    status=BusinessCaseStatus.PUBLISHED,
                    published_at=datetime(2026, 1, 1, 8, 0, 0),
                    created_at=datetime(2026, 1, 1, 8, 0, 0),
                    updated_at=datetime(2026, 1, 1, 8, 0, 0),
                ),
            ),
            next_cursor="cursor-3",
            available_tags=("连锁增长", "AI 提效"),
        )


class StubPublicDetailUseCase:
    def __init__(self, *, error: Exception | None = None) -> None:
        self._error = error

    async def execute(self, query) -> BusinessCaseDetailResult:
        assert query.case_id == CASE_ID
        if self._error is not None:
            raise self._error
        return _build_detail_result(case_id=CASE_ID, status=BusinessCaseStatus.PUBLISHED)


class StubDeleteBusinessCaseUseCase:
    async def execute(self, command) -> DeleteBusinessCaseResult:
        assert command.case_id == CASE_ID
        return DeleteBusinessCaseResult(case_id=CASE_ID)


def _build_detail_result(
    *,
    case_id: str,
    status: BusinessCaseStatus,
) -> BusinessCaseDetailResult:
    return BusinessCaseDetailResult(
        case_id=case_id,
        title="Case A",
        summary="Summary A",
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
                cover_image_url="https://example.com/business-case.png",
            ),
            market_research=BusinessCaseDocumentResult(
                document_id=DOCUMENT_ID_MARKET_RESEARCH,
                title="Market Research",
                markdown_content="# Market Research",
                cover_image_url="https://example.com/market-research.png",
            ),
            ai_business_upgrade=BusinessCaseDocumentResult(
                document_id=DOCUMENT_ID_AI_BUSINESS_UPGRADE,
                title="AI Upgrade",
                markdown_content="# AI Upgrade",
                cover_image_url="https://example.com/ai-upgrade.png",
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
                "summary": "Summary A",
                "tags": ["连锁增长", "AI 提效"],
                "cover_image_url": "https://example.com/case-a.png",
                "status": "draft",
                "documents": {
                    "business_case": {
                        "title": "Business Case",
                        "markdown_content": "# Business Case",
                        "cover_image_url": "https://example.com/business-case.png",
                    },
                    "market_research": {
                        "title": "Market Research",
                        "markdown_content": "# Market Research",
                        "cover_image_url": "https://example.com/market-research.png",
                    },
                    "ai_business_upgrade": {
                        "title": "AI Upgrade",
                        "markdown_content": "# AI Upgrade",
                        "cover_image_url": "https://example.com/ai-upgrade.png",
                    },
                },
            },
            headers={"X-Request-Id": "business-case-create"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "business-case-create"
    assert body["data"]["case_id"] == str(CASE_ID)
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
    assert body["data"]["items"][0]["tags"] == ["连锁增长"]
    assert body["data"]["next_cursor"] == "cursor-2"


def test_business_case_router_lists_public_business_cases_by_tag() -> None:
    with _build_client(
        list_public_use_case=StubListPublicBusinessCasesUseCase()
    ) as client:
        response = client.get(
            "/api/v1/business-cases?limit=10&cursor=cursor-1&tag=AI%20%E6%8F%90%E6%95%88"
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["items"][0]["tags"] == ["AI 提效"]
    assert body["data"]["next_cursor"] == "cursor-3"
    assert body["data"]["available_tags"] == ["连锁增长", "AI 提效"]


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
                        "cover_image_url": "https://example.com/business-case.png",
                    },
                    "market_research": {
                        "title": "Market Research",
                        "markdown_content": "# Market Research",
                        "cover_image_url": "https://example.com/market-research.png",
                    },
                    "ai_business_upgrade": {
                        "title": "AI Upgrade",
                        "markdown_content": "# AI Upgrade",
                        "cover_image_url": "https://example.com/ai-upgrade.png",
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
