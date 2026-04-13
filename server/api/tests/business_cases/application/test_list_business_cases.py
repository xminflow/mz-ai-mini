from __future__ import annotations

from datetime import date, datetime

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
from mz_ai_backend.modules.business_cases.domain import (
    BusinessCaseIndustry,
    BusinessCaseType,
)


class FakeBusinessCaseRepository:
    def __init__(self, *, page: BusinessCasePageSlice) -> None:
        self._page = page
        self.admin_cursor = None
        self.public_cursor = None
        self.public_type = None

    async def list_admin(self, *, limit: int, cursor, status):
        self.admin_cursor = cursor
        self.admin_limit = limit
        self.admin_status = status
        return self._page

    async def list_public(self, *, limit: int, cursor, case_type, industry, keyword):
        self.public_cursor = cursor
        self.public_limit = limit
        self.public_type = case_type
        self.public_industry = industry
        self.public_keyword = keyword
        return self._page


def _build_list_item(
    *,
    case_id: str,
    created_at: datetime,
    published_at: datetime | None,
) -> BusinessCaseListItemResult:
    return BusinessCaseListItemResult(
        case_id=case_id,
        type=BusinessCaseType.CASE,
        title=f"Case {case_id}",
        summary=f"Summary {case_id}",
        data_cutoff_date=date(2026, 4, 13),
        freshness_months=3,
        industry=BusinessCaseIndustry.CONSUMER,
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
            available_industries=(),
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
            available_industries=("科技", "消费"),
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
        ListPublicBusinessCasesQuery(
            limit=20,
            cursor=cursor,
            type=BusinessCaseType.PROJECT,
            industry=BusinessCaseIndustry.CONSUMER,
            keyword="增长",
        )
    )

    assert repository.public_cursor is not None
    assert repository.public_cursor.case_id == "999"
    assert repository.public_cursor.sort_value == datetime(2026, 1, 4, 8, 0, 0)
    assert repository.public_type == BusinessCaseType.PROJECT
    assert repository.public_industry == BusinessCaseIndustry.CONSUMER
    assert repository.public_keyword == "增长"
    assert result.next_cursor is None
    assert result.available_industries == ("科技", "消费")
