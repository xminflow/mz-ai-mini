from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class BusinessCaseInvalidDocumentSetException(BusinessException):
    """Raised when the required business case document set is invalid."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.BUSINESS_CASE_INVALID_DOCUMENT_SET,
            message="Business case documents must include exactly one of each required type.",
            http_status=HTTPStatus.UNPROCESSABLE_ENTITY,
        )


class BusinessCaseNotFoundException(BusinessException):
    """Raised when a business case cannot be found."""

    def __init__(self, *, case_id: str) -> None:
        super().__init__(
            error_code=ErrorCode.BUSINESS_CASE_NOT_FOUND,
            message=f"Business case {case_id} was not found.",
            http_status=HTTPStatus.NOT_FOUND,
        )
