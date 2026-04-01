from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from mz_ai_backend.core.exceptions import ValidationException
from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import (
    CreateBusinessCaseUseCase,
    DeleteBusinessCaseCommand,
    DeleteBusinessCaseUseCase,
    GetAdminBusinessCaseUseCase,
    GetBusinessCaseQuery,
    GetPublicBusinessCaseUseCase,
    ListAdminBusinessCasesQuery,
    ListAdminBusinessCasesUseCase,
    ListPublicBusinessCasesQuery,
    ListPublicBusinessCasesUseCase,
    ReplaceBusinessCaseUseCase,
)
from ..domain import BusinessCaseStatus
from ..domain import BusinessCaseIndustry
from ..infrastructure import (
    get_create_business_case_use_case,
    get_delete_business_case_use_case,
    get_get_admin_business_case_use_case,
    get_get_public_business_case_use_case,
    get_list_admin_business_cases_use_case,
    get_list_public_business_cases_use_case,
    get_replace_business_case_use_case,
)
from .schemas import (
    AdminBusinessCaseStatusFilter,
    BusinessCaseDetailResponse,
    BusinessCaseListResponse,
    BusinessCaseUpsertRequest,
    DeleteBusinessCaseResponse,
)


router = APIRouter()
admin_router = APIRouter(prefix="/admin/business-cases", tags=["admin-business-cases"])
public_router = APIRouter(prefix="/business-cases", tags=["business-cases"])


@admin_router.post(
    "",
    response_model=ApiResponse[BusinessCaseDetailResponse],
    summary="Create a business case",
)
async def create_business_case(
    request: BusinessCaseUpsertRequest,
    use_case: Annotated[
        CreateBusinessCaseUseCase,
        Depends(get_create_business_case_use_case),
    ],
) -> ApiResponse[BusinessCaseDetailResponse]:
    """Create a new business case aggregate for the admin view."""

    result = await use_case.execute(request.to_create_command())
    return success_response(data=BusinessCaseDetailResponse.from_result(result))


@admin_router.get(
    "/{case_id}",
    response_model=ApiResponse[BusinessCaseDetailResponse],
    summary="Get a business case",
)
async def get_admin_business_case(
    case_id: str,
    use_case: Annotated[
        GetAdminBusinessCaseUseCase,
        Depends(get_get_admin_business_case_use_case),
    ],
) -> ApiResponse[BusinessCaseDetailResponse]:
    """Return one business case aggregate for the admin view."""

    result = await use_case.execute(GetBusinessCaseQuery(case_id=case_id))
    return success_response(data=BusinessCaseDetailResponse.from_result(result))


@admin_router.get(
    "",
    response_model=ApiResponse[BusinessCaseListResponse],
    summary="List business cases",
)
async def list_admin_business_cases(
    use_case: Annotated[
        ListAdminBusinessCasesUseCase,
        Depends(get_list_admin_business_cases_use_case),
    ],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    cursor: Annotated[str | None, Query()] = None,
    status: Annotated[AdminBusinessCaseStatusFilter, Query()] = (
        AdminBusinessCaseStatusFilter.ALL
    ),
) -> ApiResponse[BusinessCaseListResponse]:
    """Return one admin-facing business case list slice."""

    query = ListAdminBusinessCasesQuery(
        limit=limit,
        cursor=cursor,
        status=_resolve_admin_status_filter(status),
    )
    result = await use_case.execute(query)
    return success_response(data=BusinessCaseListResponse.from_result(result))


@admin_router.put(
    "/{case_id}",
    response_model=ApiResponse[BusinessCaseDetailResponse],
    summary="Replace a business case",
)
async def replace_business_case(
    case_id: str,
    request: BusinessCaseUpsertRequest,
    use_case: Annotated[
        ReplaceBusinessCaseUseCase,
        Depends(get_replace_business_case_use_case),
    ],
) -> ApiResponse[BusinessCaseDetailResponse]:
    """Fully replace one business case aggregate for the admin view."""

    result = await use_case.execute(request.to_replace_command(case_id=case_id))
    return success_response(data=BusinessCaseDetailResponse.from_result(result))


@admin_router.delete(
    "/{case_id}",
    response_model=ApiResponse[DeleteBusinessCaseResponse],
    summary="Delete a business case",
)
async def delete_business_case(
    case_id: str,
    use_case: Annotated[
        DeleteBusinessCaseUseCase,
        Depends(get_delete_business_case_use_case),
    ],
) -> ApiResponse[DeleteBusinessCaseResponse]:
    """Logically delete one business case aggregate for the admin view."""

    result = await use_case.execute(DeleteBusinessCaseCommand(case_id=case_id))
    return success_response(data=DeleteBusinessCaseResponse.from_result(result))


@public_router.get(
    "",
    response_model=ApiResponse[BusinessCaseListResponse],
    summary="List published business cases",
)
async def list_public_business_cases(
    use_case: Annotated[
        ListPublicBusinessCasesUseCase,
        Depends(get_list_public_business_cases_use_case),
    ],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    cursor: Annotated[str | None, Query()] = None,
    industry: Annotated[str | None, Query()] = None,
    keyword: Annotated[str | None, Query()] = None,
) -> ApiResponse[BusinessCaseListResponse]:
    """Return one public-facing business case list slice."""

    result = await use_case.execute(
        ListPublicBusinessCasesQuery(
            limit=limit,
            cursor=cursor,
            industry=_normalize_public_industry(industry),
            keyword=_normalize_public_keyword(keyword),
        )
    )
    return success_response(data=BusinessCaseListResponse.from_result(result))


@public_router.get(
    "/{case_id}",
    response_model=ApiResponse[BusinessCaseDetailResponse],
    summary="Get a published business case",
)
async def get_public_business_case(
    case_id: str,
    use_case: Annotated[
        GetPublicBusinessCaseUseCase,
        Depends(get_get_public_business_case_use_case),
    ],
) -> ApiResponse[BusinessCaseDetailResponse]:
    """Return one published business case aggregate for the public view."""

    result = await use_case.execute(GetBusinessCaseQuery(case_id=case_id))
    return success_response(data=BusinessCaseDetailResponse.from_result(result))


router.include_router(admin_router)
router.include_router(public_router)


def _resolve_admin_status_filter(
    status: AdminBusinessCaseStatusFilter,
) -> BusinessCaseStatus | None:
    if status == AdminBusinessCaseStatusFilter.ALL:
        return None
    return BusinessCaseStatus(status.value)


def _normalize_public_industry(
    industry: str | None,
) -> BusinessCaseIndustry | None:
    if industry is None:
        return None

    normalized_industry = industry.strip()
    if normalized_industry == "":
        return None

    try:
        return BusinessCaseIndustry(normalized_industry)
    except ValueError as exc:
        raise ValidationException(message="Industry filter is invalid.") from exc


def _normalize_public_keyword(keyword: str | None) -> str | None:
    if keyword is None:
        return None

    normalized_keyword = keyword.strip()
    if normalized_keyword == "":
        return None
    return normalized_keyword
