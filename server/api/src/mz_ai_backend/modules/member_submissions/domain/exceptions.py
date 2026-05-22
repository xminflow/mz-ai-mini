from __future__ import annotations

from collections.abc import Mapping
from http import HTTPStatus
from typing import Any

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class MemberSubmissionMemberRequiredException(BusinessException):
    """Raised when a non-member account tries to submit a request."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.MEMBER_SUBMISSION_MEMBER_REQUIRED,
            message="Active membership is required to submit requests.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class MemberSubmissionQuotaExhaustedException(BusinessException):
    """Raised when the account has consumed its quota in the current period."""

    def __init__(
        self,
        *,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(
            error_code=ErrorCode.MEMBER_SUBMISSION_QUOTA_EXHAUSTED,
            message="Submission quota for the current period has been exhausted.",
            http_status=HTTPStatus.CONFLICT,
            details=details,
        )


class MemberSubmissionInvalidPayloadException(BusinessException):
    """Raised when the payload fails domain-level validation."""

    def __init__(self, *, message: str) -> None:
        super().__init__(
            error_code=ErrorCode.MEMBER_SUBMISSION_INVALID_PAYLOAD,
            message=message,
            http_status=HTTPStatus.UNPROCESSABLE_ENTITY,
        )


class MemberSubmissionNotFoundException(BusinessException):
    """Raised when the submission does not belong to the account or is gone."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.MEMBER_SUBMISSION_NOT_FOUND,
            message="Submission not found.",
            http_status=HTTPStatus.NOT_FOUND,
        )


class MemberSubmissionNotDeletableException(BusinessException):
    """Raised when trying to delete a submission whose status forbids it.

    Only pending submissions can be deleted by the owning user. processing/done/
    rejected/cancelled are non-deletable to preserve operational and audit state.
    """

    def __init__(self, *, current_status: str) -> None:
        super().__init__(
            error_code=ErrorCode.MEMBER_SUBMISSION_NOT_DELETABLE,
            message="Only pending submissions can be deleted by the user.",
            http_status=HTTPStatus.CONFLICT,
            details={"current_status": current_status},
        )
