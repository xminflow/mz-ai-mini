from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.core import ValidationException
from mz_ai_backend.modules.business_cases.application import (
    BusinessCaseListItemResult,
    ListAdminBusinessCasesQuery,
    ListAdminBusinessCasesUseCase,
    ListPublicBusinessCasesQuery,
    ListPublicBusinessCasesUseCase,
)
from mz_ai_backend.modules.business_cases.application.dtos import BusinessCasePageSlice
from mz_ai_backend.modules.business_cases.application.use_cases._common import (
    encode_cursor,
)
from mz_ai_backend.modules.business_cases.domain import BusinessCaseStatus


class FakeBusinessCaseRepository:
    def __init__(self, *, page: BusinessCasePageSlice) -> None:
        self._page = page
        self.admin_cursor = None
        self.public_cursor = None
        self.public_tag = None

    async def list_admin(self, *, limit: int, cursor, status):
        self.admin_cursor = cursor
        self.admin_limit = limit
        self.admin_status = status
        return self._page

    async def list_public(self, *, limit: int, cursor, tag):
        self.public_cursor = cursor
        self.public_limit = limit
        self.public_tag = tag
        return self._page


def _build_list_item(
    *,
    case_id: str,
    created_at: datetime,
    published_at: datetime | None,
) -> BusinessCaseListItemResult:
    return BusinessCaseListItemResult(
        case_id=case_id,
        title=f"Case {case_id}",
        summary=f"Summary {case_id}",
        tags=("连锁增长",),
        cover_image_url=f"https://example.com/{case_id}.png",
        status=BusinessCaseStatus.PUBLISHED if published_at else BusinessCaseStatus.DRAFT,
        published_at=published_at,
        created_at=created_at,
        updated_at=created_at,
    )


@pytest.mark.asyncio
async def test_list_admin_business_cases_use_case_returns_next_cursor() -> None:
    repository = FakeBusinessCaseRepository(
        page=BusinessCasePageSlice(
            items=(
                _build_list_item(
                    case_id="1003",
                    created_at=datetime(2026, 1, 3, 8, 0, 0),
                    published_at=None,
                ),
                _build_list_item(
                    case_id="1002",
                    created_at=datetime(2026, 1, 2, 8, 0, 0),
                    published_at=None,
                ),
            ),
            has_more=True,
            available_tags=(),
        )
    )
    use_case = ListAdminBusinessCasesUseCase(business_case_repository=repository)

    result = await use_case.execute(
        ListAdminBusinessCasesQuery(
            limit=2,
            cursor=None,
            status=BusinessCaseStatus.DRAFT,
        )
    )

    assert repository.admin_cursor is None
    assert repository.admin_limit == 2
    assert repository.admin_status == BusinessCaseStatus.DRAFT
    assert result.next_cursor is not None
    assert len(result.items) == 2


@pytest.mark.asyncio
async def test_list_admin_business_cases_use_case_rejects_invalid_cursor() -> None:
    repository = FakeBusinessCaseRepository(
        page=BusinessCasePageSlice(items=(), has_more=False)
    )
    use_case = ListAdminBusinessCasesUseCase(business_case_repository=repository)

    with pytest.raises(ValidationException):
        await use_case.execute(
            ListAdminBusinessCasesQuery(
                limit=20,
                cursor="not-a-valid-cursor",
                status=None,
            )
        )


@pytest.mark.asyncio
async def test_list_public_business_cases_use_case_decodes_cursor_before_query() -> None:
    repository = FakeBusinessCaseRepository(
        page=BusinessCasePageSlice(
            items=(
                _build_list_item(
                    case_id="1001",
                    created_at=datetime(2026, 1, 1, 8, 0, 0),
                    published_at=datetime(2026, 1, 5, 8, 0, 0),
                ),
            ),
            has_more=False,
            available_tags=("连锁增长", "AI 提效"),
        )
    )
    use_case = ListPublicBusinessCasesUseCase(business_case_repository=repository)
    cursor = encode_cursor(
        type(
            "Cursor",
            (),
            {"sort_value": datetime(2026, 1, 4, 8, 0, 0), "case_id": "999"},
        )()
    )

    result = await use_case.execute(
        ListPublicBusinessCasesQuery(limit=20, cursor=cursor, tag="AI 提效")
    )

    assert repository.public_cursor is not None
    assert repository.public_cursor.case_id == "999"
    assert repository.public_cursor.sort_value == datetime(2026, 1, 4, 8, 0, 0)
    assert repository.public_tag == "AI 提效"
    assert result.next_cursor is None
    assert result.available_tags == ("连锁增长", "AI 提效")
