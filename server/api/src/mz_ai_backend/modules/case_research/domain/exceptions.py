from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class CaseResearchOrderNotFoundException(BusinessException):
    """Raised when a case research order does not exist."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CASE_RESEARCH_ORDER_NOT_FOUND,
            message="Case research order does not exist.",
            http_status=HTTPStatus.NOT_FOUND,
        )


class CaseResearchOrderStatusInvalidException(BusinessException):
    """Raised when a case research order state transition is invalid."""

    def __init__(
        self, *, message: str = "Case research order state is invalid."
    ) -> None:
        super().__init__(
            error_code=ErrorCode.CASE_RESEARCH_ORDER_STATUS_INVALID,
            message=message,
            http_status=HTTPStatus.CONFLICT,
        )
