from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.modules.account_membership.infrastructure import get_current_account_id

from ..application import (
    CreateMemberSubmissionUseCase,
    DeleteMemberSubmissionCommand,
    DeleteMemberSubmissionUseCase,
    GetMyQuotaQuery,
    GetMyQuotaUseCase,
    ListMySubmissionsQuery,
    ListMySubmissionsUseCase,
)
from ..domain import SubmissionType
from ..infrastructure import (
    get_create_member_submission_use_case,
    get_delete_member_submission_use_case,
    get_get_my_quota_use_case,
    get_list_my_submissions_use_case,
)
from .schemas import (
    CreateMemberSubmissionPayload,
    CreateMemberSubmissionResponse,
    DeleteMemberSubmissionResponse,
    MyMemberSubmissionsResponse,
    MyQuotaResponse,
)


router = APIRouter(prefix="/member-submissions", tags=["member-submissions"])


@router.post(
    "",
    response_model=ApiResponse[CreateMemberSubmissionResponse],
    summary="Create one member submission ticket",
)
async def create_member_submission(
    request: CreateMemberSubmissionPayload,
    account_id: Annotated[int, Depends(get_current_account_id)],
    use_case: Annotated[
        CreateMemberSubmissionUseCase,
        Depends(get_create_member_submission_use_case),
    ],
) -> ApiResponse[CreateMemberSubmissionResponse]:
    """Create one submission ticket for the current member account."""

    result = await use_case.execute(request.to_command(account_id=account_id))
    return success_response(data=CreateMemberSubmissionResponse.from_result(result))


@router.get(
    "/me",
    response_model=ApiResponse[MyMemberSubmissionsResponse],
    summary="List current member submissions",
)
async def list_my_submissions(
    account_id: Annotated[int, Depends(get_current_account_id)],
    use_case: Annotated[
        ListMySubmissionsUseCase,
        Depends(get_list_my_submissions_use_case),
    ],
    type: Annotated[SubmissionType | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ApiResponse[MyMemberSubmissionsResponse]:
    """Return paginated submissions and current-period quotas for the account."""

    result = await use_case.execute(
        ListMySubmissionsQuery(
            account_id=account_id,
            submission_type=type,
            limit=limit,
            offset=offset,
        )
    )
    return success_response(data=MyMemberSubmissionsResponse.from_result(result))


@router.delete(
    "/{submission_id}",
    response_model=ApiResponse[DeleteMemberSubmissionResponse],
    summary="Delete one pending submission owned by the current member",
)
async def delete_member_submission(
    submission_id: int,
    account_id: Annotated[int, Depends(get_current_account_id)],
    use_case: Annotated[
        DeleteMemberSubmissionUseCase,
        Depends(get_delete_member_submission_use_case),
    ],
) -> ApiResponse[DeleteMemberSubmissionResponse]:
    """Soft-delete one submission. 仅 pending 状态可删，非所有者返回 404。"""

    result = await use_case.execute(
        DeleteMemberSubmissionCommand(
            account_id=account_id,
            submission_id=submission_id,
        )
    )
    return success_response(data=DeleteMemberSubmissionResponse.from_result(result))


@router.get(
    "/me/quota",
    response_model=ApiResponse[MyQuotaResponse],
    summary="Get current member quotas",
)
async def get_my_quota(
    account_id: Annotated[int, Depends(get_current_account_id)],
    use_case: Annotated[GetMyQuotaUseCase, Depends(get_get_my_quota_use_case)],
) -> ApiResponse[MyQuotaResponse]:
    """Return the lightweight quota snapshots for the current member."""

    result = await use_case.execute(GetMyQuotaQuery(account_id=account_id))
    return success_response(data=MyQuotaResponse.from_result(result))
