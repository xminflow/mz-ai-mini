from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.modules.admin_auth import require_admin

from ..application.admin_dtos import (
    DeleteCampAccountCommand,
    GetCampAccountQuery,
    ListCampAccountsQuery,
)
from ..application.use_cases import (
    DeleteCampAccountUseCase,
    GetCampAccountUseCase,
    ListCampAccountsUseCase,
    UpdateCampAccountMembershipUseCase,
    UpdateCampAccountStatusUseCase,
)
from ..domain import CampAccountStatus
from ..infrastructure.dependencies import (
    get_delete_camp_account_use_case,
    get_get_camp_account_use_case,
    get_list_camp_accounts_use_case,
    get_update_camp_account_membership_use_case,
    get_update_camp_account_status_use_case,
)
from .admin_schemas import (
    CampAccountAdminPageResponse,
    CampAccountAdminResponse,
    CampAccountDeleteResponse,
    UpdateCampAccountMembershipRequest,
    UpdateCampAccountStatusRequest,
)


admin_router = APIRouter(
    prefix="/admin/camp-accounts",
    tags=["admin-camp-accounts"],
    dependencies=[Depends(require_admin)],
)


@admin_router.get("", response_model=ApiResponse[CampAccountAdminPageResponse])
async def list_camp_accounts(
    use_case: Annotated[ListCampAccountsUseCase, Depends(get_list_camp_accounts_use_case)],
    keyword: str | None = Query(default=None),
    status: Literal["active", "disabled"] | None = Query(default=None),
    include_deleted: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ApiResponse[CampAccountAdminPageResponse]:
    result = await use_case.execute(
        ListCampAccountsQuery(
            keyword=keyword,
            status=CampAccountStatus(status) if status is not None else None,
            include_deleted=include_deleted,
            page=page,
            page_size=page_size,
        )
    )
    return success_response(data=CampAccountAdminPageResponse.from_page(result))


@admin_router.get("/{account_id}", response_model=ApiResponse[CampAccountAdminResponse])
async def get_camp_account(
    account_id: int,
    use_case: Annotated[GetCampAccountUseCase, Depends(get_get_camp_account_use_case)],
) -> ApiResponse[CampAccountAdminResponse]:
    result = await use_case.execute(GetCampAccountQuery(account_id=account_id))
    return success_response(data=CampAccountAdminResponse.from_view(result))


@admin_router.patch("/{account_id}/status", response_model=ApiResponse[CampAccountAdminResponse])
async def update_camp_account_status(
    account_id: int,
    request: UpdateCampAccountStatusRequest,
    use_case: Annotated[
        UpdateCampAccountStatusUseCase, Depends(get_update_camp_account_status_use_case)
    ],
) -> ApiResponse[CampAccountAdminResponse]:
    result = await use_case.execute(request.to_command(account_id=account_id))
    return success_response(data=CampAccountAdminResponse.from_view(result))


@admin_router.patch("/{account_id}/membership", response_model=ApiResponse[CampAccountAdminResponse])
async def update_camp_account_membership(
    account_id: int,
    request: UpdateCampAccountMembershipRequest,
    use_case: Annotated[
        UpdateCampAccountMembershipUseCase,
        Depends(get_update_camp_account_membership_use_case),
    ],
) -> ApiResponse[CampAccountAdminResponse]:
    result = await use_case.execute(request.to_command(account_id=account_id))
    return success_response(data=CampAccountAdminResponse.from_view(result))


@admin_router.delete("/{account_id}", response_model=ApiResponse[CampAccountDeleteResponse])
async def delete_camp_account(
    account_id: int,
    use_case: Annotated[DeleteCampAccountUseCase, Depends(get_delete_camp_account_use_case)],
) -> ApiResponse[CampAccountDeleteResponse]:
    await use_case.execute(DeleteCampAccountCommand(account_id=account_id))
    return success_response(data=CampAccountDeleteResponse(deleted=True))
