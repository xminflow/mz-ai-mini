from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import GetHealthStatusUseCase
from ..infrastructure import get_health_status_use_case
from .schemas import HealthStatusResponse


router = APIRouter(tags=["system"])


@router.get(
    "/health",
    response_model=ApiResponse[HealthStatusResponse],
    summary="Get service health status",
)
def get_health_status(
    use_case: Annotated[GetHealthStatusUseCase, Depends(get_health_status_use_case)],
) -> ApiResponse[HealthStatusResponse]:
    """Return service health metadata."""

    result = use_case.execute()
    return success_response(data=HealthStatusResponse.from_result(result))
