from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.modules.auth.application import MiniProgramIdentity

from ..application import CreateConsultationRequestUseCase
from ..infrastructure import (
    get_create_consultation_request_use_case,
    get_current_mini_program_identity,
)
from .schemas import (
    CreateConsultationRequestPayload,
    CreateConsultationRequestResponse,
)


router = APIRouter(
    prefix="/consultations/wechat-mini-program",
    tags=["consultations"],
)


@router.post(
    "/requests",
    response_model=ApiResponse[CreateConsultationRequestResponse],
    summary="Create one consultation request",
)
async def create_consultation_request(
    request: CreateConsultationRequestPayload,
    identity: Annotated[
        MiniProgramIdentity,
        Depends(get_current_mini_program_identity),
    ],
    use_case: Annotated[
        CreateConsultationRequestUseCase,
        Depends(get_create_consultation_request_use_case),
    ],
) -> ApiResponse[CreateConsultationRequestResponse]:
    """Create one consultation request for the current authenticated user."""

    result = await use_case.execute(request.to_command(identity=identity))
    return success_response(data=CreateConsultationRequestResponse.from_result(result))
