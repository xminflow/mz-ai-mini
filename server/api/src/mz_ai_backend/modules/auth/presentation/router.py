from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import (
    EnsureCurrentMiniProgramUserCommand,
    EnsureCurrentMiniProgramUserUseCase,
    MiniProgramIdentity,
    UpdateCurrentMiniProgramUserProfileUseCase,
)
from ..infrastructure.dependencies import (
    get_current_mini_program_identity,
    get_ensure_current_mini_program_user_command,
    get_ensure_current_mini_program_user_use_case,
    get_update_current_mini_program_user_profile_use_case,
)
from .schemas import (
    EnsureCurrentMiniProgramUserResponse,
    UpdateCurrentMiniProgramUserProfileRequest,
    UpdateCurrentMiniProgramUserProfileResponse,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.put(
    "/wechat-mini-program/users/current",
    response_model=ApiResponse[EnsureCurrentMiniProgramUserResponse],
    summary="Ensure the current mini program user exists",
)
async def ensure_current_mini_program_user(
    command: Annotated[
        EnsureCurrentMiniProgramUserCommand,
        Depends(get_ensure_current_mini_program_user_command),
    ],
    use_case: Annotated[
        EnsureCurrentMiniProgramUserUseCase,
        Depends(get_ensure_current_mini_program_user_use_case),
    ],
) -> ApiResponse[EnsureCurrentMiniProgramUserResponse]:
    """Create the current cloud-hosted mini program user on first access."""

    result = await use_case.execute(command)
    return success_response(data=EnsureCurrentMiniProgramUserResponse.from_result(result))


@router.put(
    "/wechat-mini-program/users/current/profile",
    response_model=ApiResponse[UpdateCurrentMiniProgramUserProfileResponse],
    summary="Sync the current mini program user profile",
)
async def update_current_mini_program_user_profile(
    request: UpdateCurrentMiniProgramUserProfileRequest,
    identity: Annotated[
        MiniProgramIdentity,
        Depends(get_current_mini_program_identity),
    ],
    use_case: Annotated[
        UpdateCurrentMiniProgramUserProfileUseCase,
        Depends(get_update_current_mini_program_user_profile_use_case),
    ],
) -> ApiResponse[UpdateCurrentMiniProgramUserProfileResponse]:
    """Persist the authorized profile for the current cloud-hosted mini program user."""

    result = await use_case.execute(request.to_command(identity=identity))
    return success_response(
        data=UpdateCurrentMiniProgramUserProfileResponse.from_result(result)
    )
