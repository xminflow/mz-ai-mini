from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import AdminIdentity, AdminLoginUseCase
from ..infrastructure.dependencies import get_admin_login_use_case, require_admin
from .schemas import AdminLoginRequest, AdminMeResponse, AdminTokenResponse


router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@router.post(
    "/login",
    response_model=ApiResponse[AdminTokenResponse],
    summary="Admin login with configured credentials",
)
async def admin_login(
    request: AdminLoginRequest,
    use_case: Annotated[AdminLoginUseCase, Depends(get_admin_login_use_case)],
) -> ApiResponse[AdminTokenResponse]:
    result = await use_case.execute(request.to_command())
    return success_response(data=AdminTokenResponse.from_result(result))


@router.get(
    "/me",
    response_model=ApiResponse[AdminMeResponse],
    summary="Return the current admin identity",
)
async def admin_me(
    identity: Annotated[AdminIdentity, Depends(require_admin)],
) -> ApiResponse[AdminMeResponse]:
    return success_response(data=AdminMeResponse.from_identity(identity))
